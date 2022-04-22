import { Token, TokenAmount, Pair, JSBI } from '@amaterasu-fi/sdk'

export default function calculateTotalStakedAmount(
  baseToken: Token,
  stakingTokenPair: Pair,
  totalStakedAmount: TokenAmount,
  totalLpTokenSupply: TokenAmount
): TokenAmount {
  // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
  if (totalLpTokenSupply.equalTo('0')) return totalLpTokenSupply
  // const mult = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18 - baseToken.decimals))
  return new TokenAmount(
    baseToken,
    JSBI.multiply(
      JSBI.divide(
        JSBI.multiply(stakingTokenPair.reserveOf(baseToken).raw, totalStakedAmount.raw), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        totalLpTokenSupply.raw
      ),
      JSBI.BigInt(2)
    )
  )
}
