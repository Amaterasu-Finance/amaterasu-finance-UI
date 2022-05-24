import { Token, TokenAmount, Pair, ProtocolName } from '@amaterasu-fi/sdk'
import { BigNumber } from 'ethers'
import { DEFAULT_PROTOCOL } from '../constants'

export default function getPair(
  tokenA: Token | undefined,
  tokenB: Token | undefined,
  reserve0: BigNumber,
  reserve1: BigNumber,
  protocol?: ProtocolName
): Pair | undefined {
  if (tokenA && tokenB && reserve0 && reserve1) {
    if (tokenA.chainId !== tokenB.chainId) return undefined
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
    return token0 && token1
      ? new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          protocol ?? DEFAULT_PROTOCOL
        )
      : undefined
  }

  return undefined
}
