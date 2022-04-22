import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'
import { LiqPool, LPS_MAINNET } from './lps'
import { Protocol, ProtocolName, PROTOCOLS_MAINNET } from './protocol'

export interface VaultInfo {
  pid: number
  farmPid: number
  active: boolean
  tokens: [Token, Token]
  stratAddress: string
  lp: LiqPool
  protocol: Protocol
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
      stratAddress: '0x81867AA6bDD0Cb22EC9cc5b03e27e926298d620E',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/WETH'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_WETH,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 2,
      farmPid: 1,
      active: true,
      stratAddress: '0x37f2b0cBc932543f253E0706E03b75Ca7B0A4E34',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDC/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_USDC_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 3,
      farmPid: 2,
      active: true,
      stratAddress: '0x5A1Ae6a60929ca14aff2bc15cf6aF755e5dCF40c',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDT/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_USDT_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 4,
      farmPid: 3,
      active: true,
      stratAddress: '0xf5Cc0696c3522d92a2aaC10E4794Ff04Bf19aD86',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDT/USDC'),
      lp: LPS_MAINNET.TRISOLARIS_USDT_USDC,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 5,
      farmPid: 4,
      active: true,
      stratAddress: '0xe8F413f01A4fC77770409cfdB48CAA9FEebf3720',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/WBTC'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_WBTC,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 6,
      farmPid: 5,
      active: true,
      stratAddress: '0xa937587D73e387F6aee5554475BB164E52bb4408',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/TRI'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_TRI,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    }
  ]
}
