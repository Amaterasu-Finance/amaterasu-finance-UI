import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'
import { LiqPool, LPS_MAINNET } from './lps'
import { PROTOCOLS_MAINNET } from './protocol'

export interface VaultInfo {
  pid: number
  farmPid: number
  active: boolean
  tokens: [Token, Token]
  stratAddress: string
  lp: LiqPool
  masterchef?: string // masterchef address for rewards info
  buybackRate?: number // buy+burn IZA %, default = 3%
  xIzaRate?: number // xIZA % of rewards, default = 20%
  xTokenRate?: number // xToken %, default = 0%
  withdrawFee?: number // withdraw fee, default = 0.1%
}

export const VAULT_INFO: {
  [chainId in ChainId]?: VaultInfo[]
} = {
  [ChainId.AURORA_MAINNET]: [
    {
      pid: 1,
      farmPid: 0,
      active: true,
      stratAddress: '0x4d96D6a1a1C746113303A1A28610Dd685bB265a4',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/WETH'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_WETH,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 2,
      farmPid: 1,
      active: true,
      stratAddress: '0x70Af3652340E4ba02a9898B065Fc4fd413ee4bF2',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDC/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_USDC_NEAR,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    }
  ]
}
