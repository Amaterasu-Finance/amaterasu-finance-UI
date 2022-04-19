import { ChainId, Token } from '@amaterasu-fi/sdk'
import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'
import { ProtocolName } from './protocol'

export interface Path {
  tokens: [Token, Token]
  protocol: ProtocolName
  path: string[]
}

export const PATHS_MAINNET: {
  [protocol in ProtocolName]?: Path
} = {
  [ProtocolName.TRISOLARIS]: {
    protocol: ProtocolName.TRISOLARIS,
    tokens: getPairTokensWithDefaults(ChainId.AURORA_MAINNET, 'NEAR/WETH'),
    path: []
  }
}

export default function getPath(protocolName: ProtocolName, tokens: [Token, Token]): any {
  return
}
