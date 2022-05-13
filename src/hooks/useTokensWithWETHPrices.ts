import { WETH, Token, Price } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import useGovernanceToken from './useGovernanceToken'
import useTokenWethPrice from './useTokenWETHPrice'
import useBlockchain from './useBlockchain'
import getToken from '../utils/getToken'
import { useActiveWeb3React } from './index'
import {
  useAuroraNearPrice,
  useRoseNearPrice,
  useTriPrice,
  useBstnNearPrice,
  useSolaceNearPrice,
  useLunaNearPrice
} from './useTokenPriceFromPair'
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

  const BSTN: Token | undefined = getToken(chainId, 'BSTN')
  const bstnNearPrice = useBstnNearPrice()

  const AURORA: Token | undefined = getToken(chainId, 'AURORA')
  const auroraNearPrice = useAuroraNearPrice()

  const SOLACE: Token | undefined = getToken(chainId, 'SOLACE')
  const solaceNearPrice = useSolaceNearPrice()

  const atLUNA: Token | undefined = getToken(chainId, 'atLUNA')
  const lunaNearPrice = useLunaNearPrice()

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
      AURORA: { token: AURORA, price: NEARPrice && auroraNearPrice?.multiply(NEARPrice) },
      ROSE: { token: ROSE, price: NEARPrice && roseNearPrice?.multiply(NEARPrice) },
      BSTN: { token: BSTN, price: NEARPrice && bstnNearPrice?.multiply(NEARPrice) },
      atLUNA: { token: atLUNA, price: NEARPrice && lunaNearPrice?.multiply(NEARPrice) },
      SOLACE: { token: SOLACE, price: NEARPrice && solaceNearPrice?.multiply(NEARPrice) }
    }
  }, [chainId, blockchain, weth, govToken, govTokenWETHPrice, NEAR, NEARWETHPrice, USDC, USDCWETHPrice])
}
