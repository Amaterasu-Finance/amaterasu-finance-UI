import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'

export interface StakingRewardsInfo {
  pid: number
  active: boolean
  tokens: [Token, Token]
  rewarderAddress?: string
  rewarderToken?: Token
}

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: StakingRewardsInfo[]
} = {
  [ChainId.MTV_MAINNET]: [
    { pid: 3, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/ONE') },
    { pid: 2, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/BUSD') },
    { pid: 1, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/WMTV') }
    // { pid: 4, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'WMTV/BUSD') }
  ],
  [ChainId.AURORA_TESTNET]: [
    { pid: 4, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/AURORA') },
    { pid: 3, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/NEAR') },
    { pid: 2, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/WETH') },
    { pid: 1, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/USDC') }
  ],
  [ChainId.AURORA_MAINNET]: [
    { pid: 6, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/SHITZU') },
    { pid: 5, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/ONE') },
    { pid: 3, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/NEAR') },
    { pid: 1, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/USDC') },
    { pid: 2, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/WETH') },
    { pid: 7, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/xIZA') },
    { pid: 4, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/AURORA') }
  ]
}
