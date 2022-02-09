import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'

export interface StakingRewardsInfo {
  pid: number
  active: boolean
  tokens: [Token, Token]
}

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: StakingRewardsInfo[]
} = {
  [ChainId.MTV_MAINNET]: [
    { pid: 1, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/WMTV') },
    { pid: 2, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'IZA/tUSDC') },
    { pid: 3, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'WMTV/tUSDC') },
    { pid: 4, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tMIM') },
    { pid: 5, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tETH') },
    { pid: 6, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tFTM') },
    { pid: 7, active: true, tokens: getPairTokensWithDefaults(ChainId.MTV_MAINNET, 'tUSDC/tONE') }
  ]
}
