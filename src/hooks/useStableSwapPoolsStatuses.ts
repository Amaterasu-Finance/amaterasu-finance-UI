import { useMemo } from 'react'

import { abi as IUniswapV2PairABI } from '@foxswap/core/build/IUniswapV2Pair.json'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { Interface } from '@ethersproject/abi'
import { JSBI } from '@amaterasu-fi/sdk'
import { BIG_INT_ZERO } from '../constants'
import { CURVE_POOLS_MAINNET, CurvePool, StableName } from '../constants/curvePools'

type StableSwapPoolStatuses = {
  [poolName: string]: {
    tvl: JSBI
  }
}

export default function useStableSwapPoolsStatuses(): StableSwapPoolStatuses {
  const stableSwapPools: CurvePool[] = useMemo(
    () => Object.values(StableName).map(name => CURVE_POOLS_MAINNET[name]),
    []
  )

  const stableSwapPoolLPTokens: string[] = stableSwapPools.map(({ address }) => address)
  // const swapAddresses: string[] = stableSwapPools.map(({ minterAddress }) => minterAddress)

  const FALLBACK_TVL = BIG_INT_ZERO
  const tvls = useMultipleContractSingleData(
    stableSwapPoolLPTokens,
    new Interface(IUniswapV2PairABI),
    'totalSupply'
  )?.map(({ result }) => result?.[0] ?? FALLBACK_TVL)

  const tvlsUSD = useMemo(() => {
    return stableSwapPools.map((pool, i) => {
      const tvlAmount = tvls[i]

      return JSBI.divide(
        JSBI.BigInt(tvlAmount),
        JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('2')) // 1e18
      )
    })
  }, [stableSwapPools, tvls])

  return useMemo(
    () =>
      stableSwapPools.reduce((acc, pool, i) => {
        acc[pool.name] = { tvl: tvlsUSD[i] }

        return acc
      }, {} as StableSwapPoolStatuses),
    [stableSwapPools, tvlsUSD]
  )
}
