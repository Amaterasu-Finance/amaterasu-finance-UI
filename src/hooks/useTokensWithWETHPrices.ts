import { WETH, Token } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import useGovernanceToken from './useGovernanceToken'
import useTokenWethPrice from './useTokenWETHPrice'
import useBlockchain from './useBlockchain'
import getToken from '../utils/getToken'
import { useActiveWeb3React } from './index'
import useUSDCPrice from '../utils/useUSDCPrice'

export default function useTokensWithWethPrices(): Record<string, any> {
  const { chainId } = useActiveWeb3React()
  const blockchain = useBlockchain()

  const weth = chainId && WETH[chainId]

  const govToken = useGovernanceToken()
  const govTokenWETHPrice = useTokenWethPrice(govToken)

  const USDCTicker = 'USDC'
  const USDC: Token | undefined = getToken(chainId, USDCTicker)
  const USDCWETHPrice = useTokenWethPrice(USDC)

  const NEAR: Token | undefined = getToken(chainId, 'NEAR')
  const NEARWETHPrice = useUSDCPrice(NEAR)

  return useMemo(() => {
    return {
      WETH: { token: weth, price: undefined },
      govToken: { token: govToken, price: govTokenWETHPrice },
      NEAR: { token: NEAR, price: NEARWETHPrice },
      USDC: { token: USDC, price: USDCWETHPrice }
    }
  }, [chainId, blockchain, weth, govToken, govTokenWETHPrice, NEAR, NEARWETHPrice, USDC, USDCWETHPrice])
}
