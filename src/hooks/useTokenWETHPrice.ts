import { useMemo } from 'react'
import { Token, WETH, Price } from '@amaterasu-fi/sdk'
import { useActiveWeb3React } from './index'
import { usePair } from '../data/Reserves'

export default function useTokenWethPrice(token: Token | undefined): Price | undefined {
  const { chainId } = useActiveWeb3React()
  const [, tokenWETHPair] = usePair(chainId && WETH[chainId], token)
  // console.log('useTokenWethPrice', token, tokenWETHPair)
  return useMemo(() => {
    return token && chainId && tokenWETHPair && tokenWETHPair?.reserve0.greaterThan('0')
      ? tokenWETHPair.priceOf(token)
      : undefined
  }, [chainId, token, tokenWETHPair])
}
