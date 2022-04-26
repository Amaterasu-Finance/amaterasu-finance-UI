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
    '0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c',
    0
  )
}

export function useAuroraUsdcPrice(): Price | undefined {
  return useTokenPriceFromPair(
    [getTokenWithDefault(ChainId.AURORA_MAINNET, 'AURORA'), getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')],
    '0x5F110f500DeF9897a1182ab38AB004E69e1B296D',
    1
  )
}
