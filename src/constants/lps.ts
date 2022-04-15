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
  }
}
