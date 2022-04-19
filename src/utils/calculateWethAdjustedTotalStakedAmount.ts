import { Token, TokenAmount, Fraction, ChainId, JSBI } from '@amaterasu-fi/sdk'
import { wrappedCurrency } from './wrappedCurrency'
import calculateTotalStakedAmount from './calculateTotalStakedAmount'
import getPair from './getPair'
import { Result } from 'state/multicall/hooks'

function pairCurrencyAmountInWeth(
  baseToken: Token | undefined,
  tokens: Record<string, any>,
  valueOfTotalStakedAmountInPairCurrency: TokenAmount
): TokenAmount | Fraction | undefined {
  if (!baseToken) return valueOfTotalStakedAmountInPairCurrency

  let mult
  switch (baseToken.symbol?.toUpperCase()) {
    case tokens?.WETH?.token?.symbol?.toUpperCase():
      return valueOfTotalStakedAmountInPairCurrency
    case tokens?.NEAR?.token?.symbol?.toUpperCase():
      mult = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(baseToken.decimals - 18))
      return tokens?.NEAR?.price
        ? valueOfTotalStakedAmountInPairCurrency.multiply(tokens?.NEAR?.price).multiply(mult)
        : valueOfTotalStakedAmountInPairCurrency
    case tokens?.govToken?.token?.symbol?.toUpperCase():
      return tokens?.govToken?.price
        ? valueOfTotalStakedAmountInPairCurrency.multiply(tokens?.govToken?.price)
        : valueOfTotalStakedAmountInPairCurrency
    case tokens?.USDC?.token?.symbol?.toUpperCase():
      mult = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - baseToken.decimals))
      return tokens?.USDC?.price
        ? valueOfTotalStakedAmountInPairCurrency.multiply(tokens?.USDC?.price).divide(mult)
        : valueOfTotalStakedAmountInPairCurrency
    case tokens?.USDT?.token?.symbol?.toUpperCase():
      mult = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - baseToken.decimals))
      return tokens?.USDC?.price
        ? valueOfTotalStakedAmountInPairCurrency.multiply(tokens?.USDC?.price).divide(mult)
        : valueOfTotalStakedAmountInPairCurrency
    default:
      return valueOfTotalStakedAmountInPairCurrency
  }
}

export default function calculateWethAdjustedTotalStakedAmount(
  chainId: ChainId,
  baseToken: Token | undefined,
  tokenData: Record<string, any>,
  tokens: [Token, Token],
  totalLpTokenSupply: TokenAmount,
  totalStakedAmount: TokenAmount,
  lpTokenReserves: Result | undefined
): TokenAmount | Fraction | undefined {
  if (!baseToken || !lpTokenReserves || !totalLpTokenSupply) return undefined

  const reserve0 = lpTokenReserves?.reserve0
  const reserve1 = lpTokenReserves?.reserve1

  const stakingTokenPair = getPair(
    wrappedCurrency(tokens[0], chainId),
    wrappedCurrency(tokens[1], chainId),
    reserve0,
    reserve1
  )
  if (!stakingTokenPair) return undefined
  const valueOfTotalStakedAmountInPairCurrency = calculateTotalStakedAmount(
    baseToken,
    stakingTokenPair,
    totalStakedAmount,
    totalLpTokenSupply
  )
  if (!valueOfTotalStakedAmountInPairCurrency) return undefined
  return pairCurrencyAmountInWeth(baseToken, tokenData, valueOfTotalStakedAmountInPairCurrency)
}
