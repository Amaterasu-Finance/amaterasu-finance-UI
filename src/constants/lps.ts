import { ChainId, Token } from '@amaterasu-fi/sdk'
import getTokenWithDefault from '../utils/getTokenWithDefault'
import { Protocol, PROTOCOLS_MAINNET, ProtocolName } from './protocol'

export interface LiqPool {
  name: string
  protocol: Protocol
  address: string
  baseToken: Token
  token0: Token
  token1: Token
  isCurve?: boolean
  minterAddress?: string
  urlName?: string
}

export const LPS_MAINNET: {
  [key: string]: LiqPool
} = {
  // ---------------------------------------------------
  // Amaterasu
  // ---------------------------------------------------
  AMATERASU_IZA_USDC: {
    name: 'IZA-USDC',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0x84E90dC0414B191E54433dFC02aa5E18FA637837',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')
  },
  AMATERASU_IZA_WETH: {
    name: 'IZA-WETH',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0x767655DA394a228b116ac93B73E3bC12a1e0C97b',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_IZA_NEAR: {
    name: 'IZA-NEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0xF7c803B09B681A3EBe54a4d64920587e3F1db90c',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')
  },
  AMATERASU_IZA_AURORA: {
    name: 'IZA-AURORA',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0x9d83d87AA9F7F8176c3e1b710537A154d5f92545',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'AURORA'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_IZA_ONE: {
    name: 'IZA-ONE',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0xBBECb9f1C888354910ABab79f1fc31B2Cc6Cf539',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'ONE'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_IZA_SHITZU: {
    name: 'IZA-SHITZU',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0x1253De3360959d2bc128d68108384f4c96EF96a9',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'SHITZU'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_IZA_XIZA: {
    name: 'IZA-xIZA',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0x572B436a1cD27c2752C290E7241Bfa095e588b8d',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'xIZA'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_IZA_STNEAR: {
    name: 'IZA-stNEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0xD131594CE9D6AB88dd46579E363D9e077D9e58dA',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_IZA_ATUST: {
    name: 'IZA-atUST',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0xEa6d3de7080e2f940298dEF6bf181947185d3Ec1',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'atUST'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA')
  },
  AMATERASU_ATUST_NEAR: {
    name: 'atUST-NEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.AMATERASU],
    address: '0xdefc3EC7d838e065e5097D6637f79ef8cC7C60bE',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'atUST'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')
  },

  // ---------------------------------------------------
  // Trisolaris
  // ---------------------------------------------------
  TRISOLARIS_NEAR_WETH: {
    name: 'NEAR-ETH',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x63da4DB6Ef4e7C62168aB03982399F9588fCd198',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH')
  },
  TRISOLARIS_USDC_NEAR: {
    name: 'USDC-NEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x20F8AeFB5697B77E0BB835A8518BE70775cdA1b0',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')
  },
  TRISOLARIS_USDT_NEAR: {
    name: 'USDT-NEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x03B666f3488a7992b2385B12dF7f35156d7b29cD',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT')
  },
  TRISOLARIS_USDT_USDC: {
    name: 'USDT-USDC',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x2fe064B6c7D274082aa5d2624709bC9AE7D16C77',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')
  },
  TRISOLARIS_NEAR_WBTC: {
    name: 'NEAR-WBTC',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0xbc8A244e8fb683ec1Fd6f88F3cc6E565082174Eb',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WBTC'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')
  },
  TRISOLARIS_NEAR_TRI: {
    name: 'NEAR-TRI',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x84b123875F0F36B966d0B6Ca14b31121bd9676AD',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'TRI'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')
  },
  TRISOLARIS_AURORA_WETH: {
    name: 'AURORA-WETH',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x5eeC60F348cB1D661E4A5122CF4638c7DB7A886e',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'AURORA'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH')
  }
}
