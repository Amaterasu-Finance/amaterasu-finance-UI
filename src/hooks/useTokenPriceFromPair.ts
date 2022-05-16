import { useMemo } from 'react'
import { Token, Price, ChainId } from '@amaterasu-fi/sdk'
import { abi as IUniswapV2PairABI } from '@foxswap/core/build/IUniswapV2Pair.json'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { Interface } from '@ethersproject/abi'
import getTokenWithDefault from '../utils/getTokenWithDefault'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export default function useTokenPriceFromPair(tokens: Token[], pairAddress: string, idx: number): Price | undefined {
  // idx should be 0 or 1
  const results = useMultipleContractSingleData([pairAddress], PAIR_INTERFACE, 'getReserves')[0]
  // console.log('useTokenWethPrice', token, tokenWETHPair)
  return useMemo(() => {
    const { result: reserves, loading } = results
    if (!tokens || !reserves || loading) return undefined
    const { reserve0, reserve1 } = reserves
    return idx === 0
      ? new Price(tokens[0], tokens[1], reserve1, reserve0)
      : new Price(tokens[0], tokens[1], reserve0, reserve1)
  }, [results, tokens])
}

export function useTriPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'TRI'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT')],
    '0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c', // USDT/TRI
    0
  )
}

export function useAuroraNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'AURORA'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0x7E9EA10E5984a09D19D05F31ca3cB65BB7df359d', // AURORA/NEAR
    1
  )
}

export function useRoseNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'ROSE'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0xbe753E99D0dBd12FB39edF9b884eBF3B1B09f26C', // NEAR/ROSE
    0
  )
}

export function useBstnNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0xBBf3D4281F10E537d5b13CA80bE22362310b2bf9', // BSTN/NEAR
    1
  )
}

export function useStNearNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0x47924Ae4968832984F4091EEC537dfF5c38948a4', // stNEAR/NEAR
    1
  )
}

export function useWbtcNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'WBTC'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0xbc8A244e8fb683ec1Fd6f88F3cc6E565082174Eb', // NEAR/WBTC
    0
  )
}

export function useSolaceNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'SOLACE'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2', // SOLACE/NEAR
    1
  )
}

export function useLunaNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'atLUNA'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0xdF8CbF89ad9b7dAFdd3e37acEc539eEcC8c47914',
    0
  )
}

export function useMetaNearPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'META'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    '0xa8CAaf35c0136033294dD286A14051fBf37aed07',
    1
  )
}
