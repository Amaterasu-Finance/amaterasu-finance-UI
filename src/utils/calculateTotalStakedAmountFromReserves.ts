import { Token, TokenAmount, JSBI } from '@amaterasu-fi/sdk'

export default function calculateTotalStakedAmountFromReserves(
  baseToken: Token,
  baseReserve: JSBI,
  totalStakedAmount: TokenAmount,
  totalLpTokenSupply: TokenAmount
): TokenAmount {
  // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
  if (totalLpTokenSupply.equalTo('0')) return totalLpTokenSupply
  const mult = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - baseToken.decimals))
  return new TokenAmount(
    baseToken,
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, baseReserve),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
      ),
      JSBI.multiply(totalLpTokenSupply.raw, mult) // normalize to the token amount of base token
    )
  )
}
