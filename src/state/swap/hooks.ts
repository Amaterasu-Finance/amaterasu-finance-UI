import useENS from '../../hooks/useENS'
// import { Version } from '../../hooks/useToggledVersion'
import { parseUnits } from '@ethersproject/units'
import {
  ChainId,
  Currency,
  CurrencyAmount,
  DEFAULT_CURRENCIES,
  Fraction,
  JSBI,
  Price,
  ProtocolName,
  SwapParameters,
  Token,
  TokenAmount,
  Trade,
  TradeType
} from '@amaterasu-fi/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CURVE_MINTER_ABI from 'constants/abis/curveMinter.json'
// import { useV1Trade } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useTradeExactIn, useTradeExactOut } from '../../hooks/Trades'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
// import useToggledVersion from '../../hooks/useToggledVersion'
import { useUserSlippageTolerance } from '../user/hooks'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { BASE_CURRENCY } from '../../connectors'
import useBlockchain from '../../hooks/useBlockchain'
import getBlockchainAdjustedCurrency from '../../utils/getBlockchainAdjustedCurrency'
import { GOVERNANCE_TOKEN } from '../../constants'
import { CURVE_POOLS_MAINNET, CurvePool, StableName } from '../../constants/curvePools'
import { Interface } from '@ethersproject/abi'
import { useMultipleContractMultipleMethods } from '../multicall/hooks'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { TradeOptions, TradeOptionsDeadline } from '@amaterasu-fi/sdk/dist/router'

const ZERO_HEX = '0x0'
const CURVE_MINTER_INTERFACE = new Interface(CURVE_MINTER_ABI)
const BIG_INT_ZERO = JSBI.BigInt('0')

export type StableTrade = {
  priceImpact: JSBI
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  stablePool: CurvePool
  executionPrice: Price
  tradeType: TradeType
  route: { path: Token[] }
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  outputAmountLessSlippage: CurrencyAmount
  protocol?: ProtocolName
}

export function getIndex(token: Token | Currency | null | undefined, tokenList: Token[]): number | undefined {
  const idx = token ? tokenList.findIndex(t => t.symbol === token.symbol) : undefined
  return idx !== undefined && idx >= 0 ? idx : undefined
}

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}

function intToHex(num: number) {
  return `0x000000000000000000000000000000000000000${num}`
}

export function getSwapParamsFromStableTrade(
  trade: StableTrade,
  options: TradeOptions | TradeOptionsDeadline
): SwapParameters {
  const methodName = trade.stablePool.swapFunctionName ?? 'swap'
  let args = [] as (string | string[])[]

  const idxIn = getIndex(trade.inputAmount.currency, trade.stablePool.tokens) ?? 0
  const idxOut = getIndex(trade.outputAmount.currency, trade.stablePool.tokens) ?? 0
  const amountIn: string = toHex(trade.inputAmount)
  const slippageAdjustedAmountOut = new Fraction('1')
    .add(options.allowedSlippage)
    .invert()
    .multiply(trade.outputAmount.raw).quotient
  const amountOut = `0x${slippageAdjustedAmountOut.toString(16)}`
  const deadline =
    'ttl' in options
      ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
      : `0x${options.deadline.toString(16)}`
  switch (methodName) {
    case 'swap':
      args = [intToHex(idxIn), intToHex(idxOut), amountIn, amountOut, deadline]
      break
    case 'exchange':
      args = [intToHex(idxIn), intToHex(idxOut), amountIn, amountOut]
      break
    default:
      args = [intToHex(idxIn), intToHex(idxOut), amountIn, amountOut, deadline]
  }
  return {
    methodName,
    args,
    value: ZERO_HEX
  }
}

export function calculatePriceImpact(
  tokenInputAmount: JSBI, // assumed to be 18d precision
  tokenOutputAmount: JSBI,
  virtualPrice = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)),
  isWithdraw = false
): JSBI {
  // We want to multiply the lpTokenAmount by virtual price
  // Deposits: (VP * output) / input - 1
  // Swaps: (1 * output) / input - 1
  // Withdraws: output / (input * VP) - 1

  /* if (tokenInputAmount.lte(0)) return Zero */
  if (JSBI.LE(tokenInputAmount, 0)) {
    return JSBI.BigInt(0)
  }

  return isWithdraw
    ? /*
          tokenOutputAmount
            .mul(BigNumber.from(10).pow(36))
            .div(tokenInputAmount.mul(virtualPrice))
            .sub(BigNumber.from(10).pow(18))
        */
      JSBI.subtract(
        JSBI.divide(
          JSBI.multiply(tokenOutputAmount, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(36))),
          JSBI.multiply(tokenInputAmount, virtualPrice)
        ),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
      )
    : /*  virtualPrice
        .mul(tokenOutputAmount)
        .div(tokenInputAmount)
        .sub(BigNumber.from(10).pow(18))
      */
      JSBI.subtract(
        JSBI.divide(JSBI.multiply(virtualPrice, tokenOutputAmount), tokenInputAmount),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
      )
}

export function computeSlippageAdjustedMinAmount(value: JSBI, allowedSlippage: number) {
  if (JSBI.equal(value, BIG_INT_ZERO)) {
    return BIG_INT_ZERO
  }

  return JSBI.divide(JSBI.multiply(value, JSBI.BigInt(10000 - allowedSlippage)), JSBI.BigInt(10000))
}

/**
 * Given an input and output amount, modifies the currency amount
 * with fewer decimals to match the currency amount with more decimals
 * @returns [CurrencyAmount, CurrencyAmount]
 */
function normalizeInputOutputAmountDecimals(
  inputAmount: CurrencyAmount | undefined,
  outputAmount: CurrencyAmount | undefined
) {
  if (inputAmount == null || outputAmount == null) {
    return [BIG_INT_ZERO, BIG_INT_ZERO]
  }

  const [{ currency: inputCurrency, raw: inputAmountRaw }, { currency: outputCurrency, raw: outputAmountRaw }] = [
    inputAmount,
    outputAmount
  ]

  switch (true) {
    case inputCurrency.decimals > outputCurrency.decimals: {
      return [
        inputAmountRaw,
        JSBI.multiply(
          outputAmountRaw,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(inputCurrency.decimals - outputCurrency.decimals))
        )
      ]
    }
    case inputCurrency.decimals < outputCurrency.decimals: {
      return [
        JSBI.multiply(
          inputAmountRaw,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(outputCurrency.decimals - inputCurrency.decimals))
        ),
        outputAmountRaw
      ]
    }
    default:
      return [inputAmountRaw, outputAmountRaw]
  }
}

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>(state => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      const symbol: string = BASE_CURRENCY && BASE_CURRENCY.symbol ? BASE_CURRENCY.symbol : 'ETH'
      dispatch(
        selectCurrency({
          field,
          currencyId:
            currency instanceof Token
              ? currency.address
              : currency && DEFAULT_CURRENCIES.includes(currency)
              ? symbol
              : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  allTrades?: (Trade | null)[]
  inputError?: string
} {
  const { account } = useActiveWeb3React()

  const blockchain = useBlockchain()

  // const toggledVersion = useToggledVersion()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradesExactIn = [
    useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, ProtocolName.AMATERASU),
    useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, ProtocolName.TRISOLARIS),
    useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, ProtocolName.WANNASWAP),
    useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, ProtocolName.NEARPAD)
  ]
  const bestTradesExactOut = [
    useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, ProtocolName.AMATERASU),
    useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, ProtocolName.TRISOLARIS),
    useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, ProtocolName.WANNASWAP),
    useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, ProtocolName.NEARPAD)
  ]
  // Immediately sort them so the first trade is always the best
  bestTradesExactIn?.sort((a, b) => (a?.outputAmount.greaterThan(b?.outputAmount ?? '0') ? -1 : 1))
  bestTradesExactOut?.sort((a, b) =>
    a?.inputAmount.lessThan(b?.inputAmount ?? '10000000000000000000000000000000') ? -1 : 1
  )
  // console.log('bestTradeIn', bestTradesExactIn[0])
  // console.log('bestTradeOut', bestTradesExactOut[0])
  const v2Trade = isExactIn ? bestTradesExactIn[0] : bestTradesExactOut[0]

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  // get link to trade on v1, if a better rate exists
  // const v1Trade = useV1Trade(isExactIn, currencies[Field.INPUT], currencies[Field.OUTPUT], parsedAmount)

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradesExactIn[0] && involvesAddress(bestTradesExactIn[0], formattedTo)) ||
      (bestTradesExactOut[0] && involvesAddress(bestTradesExactOut[0], formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    const amountInCurrency = getBlockchainAdjustedCurrency(blockchain, amountIn?.currency)
    inputError = 'Insufficient ' + amountInCurrency?.symbol + ' balance'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    allTrades: isExactIn ? bestTradesExactIn : bestTradesExactOut,
    inputError
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === BASE_CURRENCY.symbol) return BASE_CURRENCY.symbol as string
    if (valid === false) return BASE_CURRENCY.symbol as string
  }
  return BASE_CURRENCY.symbol ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (inputCurrency.toUpperCase() === BASE_CURRENCY.symbol) {
      outputCurrency = GOVERNANCE_TOKEN[ChainId.AURORA_MAINNET].address
    } else if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}

export function isValidArgs(args: any[], parsedAmount: CurrencyAmount | undefined): boolean {
  return parsedAmount !== undefined && parsedAmount.greaterThan('0') && !args.some(arg => arg === undefined)
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedStableSwapInfo(): (StableTrade | null)[] {
  const { account, chainId } = useActiveWeb3React()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const inputToken = wrappedCurrency(inputCurrency ?? undefined, chainId)
  const outputToken = wrappedCurrency(outputCurrency ?? undefined, chainId)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const stableSwapPools: CurvePool[] = useMemo(() => Object.values(StableName).map(name => CURVE_POOLS_MAINNET[name]), [
    CURVE_POOLS_MAINNET
  ])

  const args = useMemo(
    () =>
      stableSwapPools.map(({ tokens }) => [
        getIndex(isExactIn ? inputToken : outputToken, tokens),
        getIndex(isExactIn ? outputToken : inputToken, tokens),
        parsedAmount?.raw.toString()
      ]),
    [stableSwapPools, isExactIn, inputToken, outputToken, parsedAmount]
  )
  const swapAddresses: (string | undefined)[] = useMemo(
    () =>
      stableSwapPools.map(({ minterAddress }, idx) => {
        return isValidArgs(args[idx], parsedAmount) ? minterAddress : undefined
      }),
    [stableSwapPools, args]
  )
  const fcnNames: string[] = stableSwapPools.map(
    ({ calculateSwapFunctionName }) => calculateSwapFunctionName ?? 'calculateSwap'
  )

  const calculateSwapResponse = useMultipleContractMultipleMethods(
    swapAddresses,
    CURVE_MINTER_INTERFACE,
    fcnNames,
    args
  )

  const [allowedSlippage] = useUserSlippageTolerance()
  const tokenTradeIn = isExactIn ? currencies[Field.INPUT] : currencies[Field.OUTPUT]
  const tokenTradeOut = isExactIn ? currencies[Field.OUTPUT] : currencies[Field.INPUT]

  return useMemo(() => {
    return stableSwapPools.map((stablePool, idx) => {
      const amountToReceive = calculateSwapResponse[idx]?.result?.[0] ?? BIG_INT_ZERO
      const amountToReceiveJSBI = JSBI.BigInt(amountToReceive)
      const amountOutLessSlippageNew = computeSlippageAdjustedMinAmount(amountToReceiveJSBI, allowedSlippage)

      const executionPrice =
        tokenTradeIn &&
        tokenTradeOut &&
        (JSBI.LE(amountOutLessSlippageNew, BIG_INT_ZERO)
          ? new Price(tokenTradeIn, tokenTradeOut, JSBI.BigInt(1), BIG_INT_ZERO)
          : new Price(tokenTradeIn, tokenTradeOut, amountToReceiveJSBI, amountOutLessSlippageNew))

      let inputAmount = isExactIn ? parsedAmount : inputToken && new TokenAmount(inputToken, amountToReceiveJSBI)
      inputAmount = inputAmount?.equalTo('0') ? undefined : inputAmount
      const outputAmount = isExactIn ? outputToken && new TokenAmount(outputToken, amountToReceiveJSBI) : parsedAmount
      const outputAmountLessSlippage = isExactIn
        ? outputToken && new TokenAmount(outputToken, amountOutLessSlippageNew)
        : parsedAmount

      const [normalizedRawInputAmount, normalizedRawOutputAmount] = normalizeInputOutputAmountDecimals(
        inputAmount,
        outputAmount
      )
      const priceImpact = JSBI.equal(normalizedRawOutputAmount, BIG_INT_ZERO)
        ? BIG_INT_ZERO
        : calculatePriceImpact(normalizedRawInputAmount, normalizedRawOutputAmount)

      const priceImpactAbs = JSBI.greaterThan(priceImpact, BIG_INT_ZERO)
        ? priceImpact
        : JSBI.multiply(priceImpact, JSBI.BigInt('-1'))

      if (
        inputToken &&
        outputToken &&
        executionPrice &&
        inputAmount &&
        inputAmount.greaterThan('0') &&
        outputAmount &&
        outputAmount.greaterThan('0') &&
        outputAmountLessSlippage
      ) {
        const route = {
          path: [isExactIn ? inputToken : outputToken, isExactIn ? outputToken : inputToken]
        }
        return {
          priceImpact: priceImpactAbs,
          currencies,
          currencyBalances,
          parsedAmount,
          stablePool,
          executionPrice,
          route,
          tradeType: isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
          inputAmount,
          outputAmount,
          outputAmountLessSlippage
        }
      } else {
        return null
      }
    })
  }, [calculateSwapResponse, tokenTradeIn, tokenTradeOut, inputToken, outputToken, parsedAmount])
}
