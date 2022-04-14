import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'
import { LiqPool, LPS_MAINNET } from './lps'
import { PROTOCOLS_MAINNET } from './protocol'

export interface VaultInfo {
  pid: number
  farmPid: number
  active: boolean
  tokens: [Token, Token] | Token
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
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/WETH'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_WETH,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    }
  ]
}
