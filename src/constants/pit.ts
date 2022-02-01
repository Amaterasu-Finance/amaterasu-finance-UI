import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'

export const PIT_POOLS: {
  [chainId in ChainId]?: {
    pid?: number
    tokens: [Token, Token]
  }[]
} = {
  [ChainId.MTV_MAINNET]: [
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/WMTV') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/tUSDC') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'WMTV/tUSDC') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tETH') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, '1USDC/tMIM') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tFTM') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tONE') }
  ]
}
