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
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/BUSD') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/WONE') },
    { tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'WMTV/BUSD') }
  ],
  [ChainId.AURORA_TESTNET]: [
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'USDC/WETH') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/USDC') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/WETH') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/NEAR') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'WETH/AURORA') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/AURORA') }
  ],
  [ChainId.AURORA_MAINNET]: [
    // { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/xIZA') } // xIZA won't ever work
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'AURORA/USDC') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/USDC') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/WETH') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/NEAR') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/ONE') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/SHITZU') },
    { tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/AURORA') }
  ]
}
