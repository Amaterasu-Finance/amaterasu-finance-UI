import { WETH, Token, Price } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import useGovernanceToken from './useGovernanceToken'
import useTokenWethPrice from './useTokenWETHPrice'
import useBlockchain from './useBlockchain'
import getToken from '../utils/getToken'
import { useActiveWeb3React } from './index'
import { useAuroraUsdcPrice, useRoseNearPrice, useTriPrice } from './useTokenPriceFromPair'
import useUSDCPrice from '../utils/useUSDCPrice'

export default function useTokensWithWethPrices(): Record<string, any> {
  const { chainId } = useActiveWeb3React()
  const blockchain = useBlockchain()

  const weth = chainId && WETH[chainId]
  const wethPrice = weth && new Price(weth, weth, '1', '1')

  const govToken = useGovernanceToken()
  const govTokenWETHPrice = useTokenWethPrice(govToken)
  const govTokenPrice = useUSDCPrice(govToken)

  const USDC: Token | undefined = getToken(chainId, 'USDC')
  const USDT: Token | undefined = getToken(chainId, 'USDT')
  const USDCWETHPrice = useTokenWethPrice(USDC)

  const NEAR: Token | undefined = getToken(chainId, 'NEAR')
  const NEARWETHPrice = useTokenWethPrice(NEAR)
  const NEARPrice = useUSDCPrice(NEAR)

  const TRI: Token | undefined = getToken(chainId, 'TRI')
  const triPrice = useTriPrice()

  const ROSE: Token | undefined = getToken(chainId, 'ROSE')
  const roseNearPrice = useRoseNearPrice()

  const AURORA: Token | undefined = getToken(chainId, 'AURORA')
  const auroraPrice = useAuroraUsdcPrice()

  return useMemo(() => {
    return {
      WETH: { token: weth, price: wethPrice },
      govToken: { token: govToken, price: govTokenWETHPrice },
      NEAR: { token: NEAR, price: NEARWETHPrice },
      USDT: { token: USDT, price: USDCWETHPrice },
      USDC: { token: USDC, price: USDCWETHPrice },
      // USDC prices
      TRI: { token: TRI, price: triPrice },
      IZA: { token: govToken, price: govTokenPrice },
      AURORA: { token: AURORA, price: auroraPrice },
      ROSE: { token: ROSE, price: NEARPrice && roseNearPrice?.multiply(NEARPrice) }
    }
  }, [chainId, blockchain, weth, govToken, govTokenWETHPrice, NEAR, NEARWETHPrice, USDC, USDCWETHPrice])
}
