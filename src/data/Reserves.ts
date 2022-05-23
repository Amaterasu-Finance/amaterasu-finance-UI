import { TokenAmount, Pair, Currency, ProtocolName } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import { abi as IUniswapV2PairABI } from '@foxswap/core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../hooks'

import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { DEFAULT_PROTOCOL } from '../constants'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export function usePairs(
  currencies: [Currency | undefined, Currency | undefined][],
  protocol?: ProtocolName
): [PairState, Pair | null][] {
  const activeProtocol = protocol ?? DEFAULT_PROTOCOL
  const { chainId } = useActiveWeb3React()

  const tokens = useMemo(() => {
    return currencies.map(([currencyA, currencyB]) => [
      wrappedCurrency(currencyA, chainId),
      wrappedCurrency(currencyB, chainId)
    ])
  }, [chainId, currencies])

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && tokenA.chainId === tokenB.chainId && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB, activeProtocol)
          : undefined
      }),
    [tokens]
  )
  // console.log('usePairs - pairAddresses', pairAddresses)

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')
  // console.log('usePairs - results', results)

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.chainId !== tokenB.chainId || tokenA.equals(tokenB))
        return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          activeProtocol
        )
      ]
    })
  }, [results, tokens])
}

export function usePair(tokenA?: Currency, tokenB?: Currency, protocol?: ProtocolName): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]], protocol)[0]
}
