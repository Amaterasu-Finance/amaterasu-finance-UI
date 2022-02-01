import { ChainId, WETH, Token, Blockchain } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import useGovernanceToken from './useGovernanceToken'
import useTokenWethPrice from './useTokenWETHPrice'
import useBlockchain from './useBlockchain'
import getToken from '../utils/getToken'
import { useActiveWeb3React } from './index'

export default function useTokensWithWethPrices(): Record<string, any> {
  const { chainId } = useActiveWeb3React()
  const blockchain = useBlockchain()

  const weth = chainId && WETH[chainId]

  const govToken = useGovernanceToken()
  const govTokenWETHPrice = useTokenWethPrice(govToken)

  const BUSDTicker = chainId !== ChainId.MTV_MAINNET ? 'BUSD' : 'BUSD'
  const BUSD: Token | undefined = getToken(chainId, BUSDTicker)
  const BUSDWETHPrice = useTokenWethPrice(BUSD)

  const USDCTicker = blockchain === Blockchain.MTV ? 'tUSDC' : 'tUSDC'
  const USDC: Token | undefined = getToken(chainId, USDCTicker)
  const USDCWETHPrice = useTokenWethPrice(USDC)

  // Harmony specific tokens
  const bscBUSD: Token | undefined = blockchain === Blockchain.MTV ? getToken(chainId, 'bscBUSD') : undefined
  const bscBUSDWETHPrice = useTokenWethPrice(bscBUSD)

  const bridgedETH: Token | undefined = Blockchain.MTV ? getToken(chainId, 'tETH') : undefined
  const bridgedETHWETHPrice = useTokenWethPrice(bridgedETH)

  return useMemo(() => {
    return {
      WETH: { token: weth, price: undefined },
      govToken: { token: govToken, price: govTokenWETHPrice },
      BUSD: { token: BUSD, price: BUSDWETHPrice },
      USDC: { token: USDC, price: USDCWETHPrice },
      bscBUSD: { token: bscBUSD, price: bscBUSDWETHPrice },
      bridgedETH: { token: bridgedETH, price: bridgedETHWETHPrice }
    }
  }, [
    chainId,
    blockchain,
    weth,
    govToken,
    govTokenWETHPrice,
    BUSD,
    BUSDWETHPrice,
    USDC,
    USDCWETHPrice,
    bscBUSD,
    bscBUSDWETHPrice,
    bridgedETH,
    bridgedETHWETHPrice
  ])
}
