import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'

export interface StakingRewardsInfo {
  pid: number
  active: boolean
  name: string
  tokens: [Token, Token]
  rewarderAddress?: string
  rewarderToken?: Token
}

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: StakingRewardsInfo[]
} = {
  [ChainId.MTV_MAINNET]: [],
  [ChainId.AURORA_TESTNET]: [
    {
      name: 'IZA/AURORA',
      pid: 4,
      active: true,
      tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/AURORA')
    },
    { name: 'IZA/ONE', pid: 3, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/NEAR') },
    { name: 'IZA/WETH', pid: 2, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/WETH') },
    { name: 'IZA/USDC', pid: 1, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_TESTNET, 'IZA/USDC') }
  ],
  [ChainId.AURORA_MAINNET]: [
    {
      name: 'IZA/SHITZU',
      pid: 6,
      active: true,
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/SHITZU')
    },
    {
      name: 'IZA/stNEAR',
      pid: 8,
      active: true,
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/stNEAR')
    },
    {
      name: 'IZA/atUST',
      pid: 9,
      active: true,
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/atUST')
    },
    {
      name: 'atUST/NEAR',
      pid: 10,
      active: true,
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'atUST/NEAR')
    },
    { name: 'IZA/ONE', pid: 5, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/ONE') },
    { name: 'IZA/NEAR', pid: 3, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/NEAR') },
    { name: 'IZA/USDC', pid: 1, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/USDC') },
    { name: 'IZA/WETH', pid: 2, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/WETH') },
    { name: 'IZA/xIZA', pid: 7, active: true, tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/xIZA') },
    {
      name: 'IZA/AURORA',
      pid: 4,
      active: true,
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/AURORA')
    }
  ]
}
