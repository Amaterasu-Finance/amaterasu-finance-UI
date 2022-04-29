import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'
import { LiqPool, LPS_MAINNET } from './lps'
import { Protocol, ProtocolName, PROTOCOLS_MAINNET } from './protocol'
import getTokenWithDefault from '../utils/getTokenWithDefault'
import { CURVE_POOLS_MAINNET, CurvePool } from './curvePools'

export interface VaultInfo {
  pid: number
  farmPid: number
  active: boolean
  tokens: Token[]
  stratAddress: string
  lp: LiqPool | CurvePool
  protocol: Protocol
  masterchef?: string // masterchef address for rewards info
  // double reward info
  bonusRewarderAddress?: string
  bonusRewarderToken?: Token
  bonusRewarderTokenPerBlock?: string
  // Vault setup
  buybackRate?: number // buy+burn IZA %, default = 3%
  xIzaRate?: number // xIZA % of rewards, default = 20%
  xTokenRate?: number // xToken %, default = 0%
  withdrawFee?: number // withdraw fee, default = 0.1%
}

export const VAULT_INFO: {
  [chainId in ChainId]?: VaultInfo[]
} = {
  [ChainId.AURORA_MAINNET]: [
    // ---------------------------------------------------
    // Amaterasu
    // ---------------------------------------------------

    {
      pid: 18,
      farmPid: 1,
      active: true,
      stratAddress: '0x52614eE4f0DbaeE0C5cD08DD62324Cd2f93D895F',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/USDC'),
      lp: LPS_MAINNET.AMATERASU_IZA_USDC,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 19,
      farmPid: 2,
      active: true,
      stratAddress: '0xa2267e590e5aCcd356bBc53290C52Fe50069FBb0',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/WETH'),
      lp: LPS_MAINNET.AMATERASU_IZA_WETH,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 20,
      farmPid: 3,
      active: true,
      stratAddress: '0xb3C7c030007eD9aBE82ba928F636a21540AC98a8',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/NEAR'),
      lp: LPS_MAINNET.AMATERASU_IZA_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 21,
      farmPid: 4,
      active: true,
      stratAddress: '0xD1F54ccbd6a2F8fcb9D3Bc1feDbbE8adEEc1fcD7',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/AURORA'),
      lp: LPS_MAINNET.AMATERASU_IZA_AURORA,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 22,
      farmPid: 5,
      active: true,
      stratAddress: '0x1C7F1214689A7563Ae88a223C5E622f4f569e131',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/ONE'),
      lp: LPS_MAINNET.AMATERASU_IZA_ONE,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 23,
      farmPid: 6,
      active: true,
      stratAddress: '0xe6f147d93B4A94B72457cD3BDcbb672A01391121',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/SHITZU'),
      lp: LPS_MAINNET.AMATERASU_IZA_SHITZU,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 24,
      farmPid: 7,
      active: true,
      stratAddress: '0xceABBE4994d0592C69842A3B38f20640a8d1b380',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/xIZA'),
      lp: LPS_MAINNET.AMATERASU_IZA_XIZA,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 25,
      farmPid: 8,
      active: true,
      stratAddress: '0x7a8B63e13525F6AB74CD1d78d54d8fefB94D977E',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/stNEAR'),
      lp: LPS_MAINNET.AMATERASU_IZA_STNEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 26,
      farmPid: 9,
      active: true,
      stratAddress: '0xC7aE8b94DE8672128e9ED11D124A941B782d5560',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'IZA/atUST'),
      lp: LPS_MAINNET.AMATERASU_IZA_ATUST,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    {
      pid: 27,
      farmPid: 10,
      active: true,
      stratAddress: '0x106FFbA39522897bf39f4c0AfD59DD5C5df22787',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'atUST/NEAR'),
      lp: LPS_MAINNET.AMATERASU_ATUST_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
      masterchef: PROTOCOLS_MAINNET.Amaterasu.masterchefV1,
      buybackRate: 0.0,
      xIzaRate: 50.0
    },
    // ---------------------------------------------------
    // Rose
    // ---------------------------------------------------
    {
      pid: 28,
      farmPid: 0,
      active: true,
      stratAddress: '0x3546E15f89e7D27B9885f54A81a36CbB46D3B9ed',
      tokens: CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT.tokens,
      lp: CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT,
      protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
      masterchef: CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT.stakingAddress,
      bonusRewarderTokenPerBlock: '234774490878515970'
    },
    // ---------------------------------------------------
    // Trisolaris
    // ---------------------------------------------------
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
      active: false,
      stratAddress: '0x37f2b0cBc932543f253E0706E03b75Ca7B0A4E34',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'USDC/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_USDC_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV1
    },
    {
      pid: 3,
      farmPid: 2,
      active: false,
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
    },
    {
      pid: 7,
      farmPid: 0,
      active: true,
      stratAddress: '0x5c16A91E7720Bc8A4E87a4cd8e07d16D3Ee8Dd46',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'AURORA/WETH'),
      lp: LPS_MAINNET.TRISOLARIS_AURORA_WETH,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV2,
      bonusRewarderAddress: '0x94669d7a170bfe62FAc297061663e0B48C63B9B5',
      bonusRewarderToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'AURORA'),
      bonusRewarderTokenPerBlock: '1556069959000000'
    },
    {
      pid: 29,
      farmPid: 23,
      active: true,
      stratAddress: '0xC3bAf1782Eec36E9ca40f710fD1B9Dc39464d038',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'BSTN/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_BSTN_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV2,
      bonusRewarderToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'),
      bonusRewarderTokenPerBlock: '7273065476000000000'
    },
    {
      pid: 30,
      farmPid: 20,
      active: true,
      stratAddress: '0x7F52A95262013090dFd4571Fc72c1174063d6b45',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/ROSE'),
      lp: LPS_MAINNET.TRISOLARIS_NEAR_ROSE,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV2,
      bonusRewarderToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'ROSE'),
      bonusRewarderTokenPerBlock: '48225308640000000'
    },
    {
      pid: 31,
      farmPid: 21,
      active: true,
      stratAddress: '0xdfbDC73243918F4E9Aa68612845e67ABeFBF7c5d',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'RUSD/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_RUSD_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV2,
      bonusRewarderToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'ROSE'),
      bonusRewarderTokenPerBlock: '48225308640000000'
    },
    {
      pid: 32,
      farmPid: 10,
      active: true,
      stratAddress: '0x28c5d7aA1532361E1D207f612e6126F9cB6E5CF5',
      tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'SOLACE/NEAR'),
      lp: LPS_MAINNET.TRISOLARIS_SOLACE_NEAR,
      protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
      masterchef: PROTOCOLS_MAINNET.Trisolaris.masterchefV2,
      bonusRewarderToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'SOLACE'),
      bonusRewarderTokenPerBlock: '771604938300000000'
    }
  ]
}
