import { Token, TokenAmount, Fraction, ChainId } from '@amaterasu-fi/sdk'
// import { wrappedCurrency } from './wrappedCurrency'
import calculateTotalStakedAmountFromReserves from './calculateTotalStakedAmountFromReserves'
// import getPair from './getPair'
import { Result } from 'state/multicall/hooks'

function pairCurrencyAmountInWeth(
  baseToken: Token | undefined,
  tokens: Record<string, any>,
  valueOfTotalStakedAmountInPairCurrency: TokenAmount
): TokenAmount | Fraction | undefined {
  if (!baseToken) return valueOfTotalStakedAmountInPairCurrency

  switch (baseToken.symbol?.toUpperCase()) {
    case tokens?.WETH?.token?.symbol?.toUpperCase():
      return valueOfTotalStakedAmountInPairCurrency
    case tokens?.govToken?.token?.symbol?.toUpperCase():
      return tokens?.govToken?.price
        ? valueOfTotalStakedAmountInPairCurrency.multiply(tokens?.govToken?.price)
        : valueOfTotalStakedAmountInPairCurrency
    case tokens?.USDC?.token?.symbol?.toUpperCase() || tokens?.BUSD?.token?.symbol?.toUpperCase():
      return tokens?.USDC?.price
        ? valueOfTotalStakedAmountInPairCurrency.multiply(tokens?.USDC?.price)
        : valueOfTotalStakedAmountInPairCurrency
    default:
      return valueOfTotalStakedAmountInPairCurrency
  }
}

export default function calculateWethAdjustedTotalStakedAmountFromReserves(
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

  const baseReserve = baseToken && (baseToken === tokens[0] ? reserve0 : baseToken === tokens[1] ? reserve1 : undefined)
  !baseReserve &&
    console.error(
      'didnt find baseReserve for base =',
      baseToken.symbol,
      ', tokens =',
      tokens[0].symbol,
      tokens[1].symbol
    )

  const valueOfTotalStakedAmountInPairCurrency = calculateTotalStakedAmountFromReserves(
    baseToken,
    baseReserve,
    totalStakedAmount,
    totalLpTokenSupply
  )
  if (!valueOfTotalStakedAmountInPairCurrency) return undefined
  return pairCurrencyAmountInWeth(baseToken, tokenData, valueOfTotalStakedAmountInPairCurrency)
}
