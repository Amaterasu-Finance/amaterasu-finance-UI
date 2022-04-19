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
    },
    {
      pid: 3,
      farmPid: 2,
      active: true,
      stratAddress: '0x0a6038F73dEEd8540E116cD8c5e670DbfcbEc821',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDT/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_USDT_NEAR,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 4,
      farmPid: 3,
      active: true,
      stratAddress: '0x09d76315D7dEd4caF85C7b8Ac187eE2AFB1833A5',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDT/USDC'),
      lp: LPS_MAINNET.TRISOLARIS_USDT_USDC,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 5,
      farmPid: 4,
      active: true,
      stratAddress: '0xA5a0207692775eAfD86A121C249fc2A290503d29',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/WBTC'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_WBTC,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 6,
      farmPid: 5,
      active: true,
      stratAddress: '0x19B92f22215F14DB1DD821DE8F6dD38085449DC2',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/TRI'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_TRI,
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    }
  ]
}
