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
}

export const LPS_MAINNET: {
  [key: string]: LiqPool
} = {
  TRISOLARIS_NEAR_WETH: {
    name: 'NEAR/ETH',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x63da4DB6Ef4e7C62168aB03982399F9588fCd198',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH')
  },
  TRISOLARIS_USDC_NEAR: {
    name: 'USDC/NEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x20F8AeFB5697B77E0BB835A8518BE70775cdA1b0',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')
  },
  TRISOLARIS_USDT_NEAR: {
    name: 'USDT/NEAR',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x03B666f3488a7992b2385B12dF7f35156d7b29cD',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT')
  },
  TRISOLARIS_USDT_USDC: {
    name: 'USDT/USDC',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x2fe064B6c7D274082aa5d2624709bC9AE7D16C77',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')
  },
  TRISOLARIS_NEAR_WBTC: {
    name: 'NEAR/WBTC',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0xbc8A244e8fb683ec1Fd6f88F3cc6E565082174Eb',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WBTC'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')
  },
  TRISOLARIS_NEAR_TRI: {
    name: 'NEAR/TRI',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x84b123875F0F36B966d0B6Ca14b31121bd9676AD',
    token0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    token1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'TRI'),
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')
  }
}
