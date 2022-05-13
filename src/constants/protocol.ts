import { ChainId, Token } from '@amaterasu-fi/sdk'
import getTokenWithDefault from '../utils/getTokenWithDefault'

export enum ProtocolName {
  TRISOLARIS = 'Trisolaris',
  WANNASWAP = 'WannaSwap',
  AMATERASU = 'Amaterasu',
  ROSE = 'Rose',
  BASTION = 'Bastion'
}

export interface Protocol {
  name: string
  xToken?: Token
  buyTokenUrl?: string
  addLiquidityUrl: string
  nativeToken?: Token
  routerAddress?: string
  masterchefV1?: string
  masterchefV2?: string
  // The per block function signature. i.e. triPerBlock => '0x7030c1a0'
  perBlockFunctionSig: string
  logoFilename: string
}

export const PROTOCOLS_MAINNET: {
  [protocolName in ProtocolName]: Protocol
} = {
  [ProtocolName.AMATERASU]: {
    name: ProtocolName.AMATERASU,
    nativeToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'IZA'),
    xToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'xIZA'),
    routerAddress: '0x3d99B2F578d94f61adcD899DE55F2991522cefE1',
    masterchefV1: '0xAE20c9F0c4a7E0098D322F690DFea6534E105614',
    perBlockFunctionSig: '0x5fa7b83f',
    buyTokenUrl: 'https://app.amaterasu.finance/#/swap?outputCurrency=',
    addLiquidityUrl: 'https://app.amaterasu.finance/#/add/',
    logoFilename: 'images/protocols/amaterasu.png'
  },
  [ProtocolName.ROSE]: {
    name: ProtocolName.ROSE,
    nativeToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'ROSE'),
    perBlockFunctionSig: '',
    logoFilename: 'images/protocols/rose.png',
    addLiquidityUrl: 'https://app.rose.fi/#/pools/'
  },
  [ProtocolName.BASTION]: {
    name: ProtocolName.BASTION,
    nativeToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'),
    perBlockFunctionSig: '',
    logoFilename: 'images/protocols/bastion_logo.png',
    addLiquidityUrl: 'https://www.trisolaris.io/#/swap/'
  },
  [ProtocolName.TRISOLARIS]: {
    name: ProtocolName.TRISOLARIS,
    nativeToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'TRI'),
    xToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'xTRI'),
    routerAddress: '0x2CB45Edb4517d5947aFdE3BEAbF95A582506858B',
    masterchefV1: '0x1f1Ed214bef5E83D8f5d0eB5D7011EB965D0D79B',
    masterchefV2: '0x3838956710bcc9D122Dd23863a0549ca8D5675D6',
    perBlockFunctionSig: '0x7030c1a0',
    buyTokenUrl: 'https://www.trisolaris.io/#/swap?outputCurrency=',
    addLiquidityUrl: 'https://www.trisolaris.io/#/add/',
    logoFilename: 'images/protocols/tri.svg'
  },
  [ProtocolName.WANNASWAP]: {
    name: ProtocolName.WANNASWAP,
    nativeToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WANNA'),
    xToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WANNAx'),
    routerAddress: '0xa3a1eF5Ae6561572023363862e238aFA84C72ef5',
    masterchefV1: '0x2B2e72C232685fC4D350Eaa92f39f6f8AD2e1593',
    masterchefV2: '0xC574bf5Dd3635Bf839D737CfB214993521D57d32',
    perBlockFunctionSig: '0x1a68f413',
    buyTokenUrl: 'https://wannaswap.finance/exchange/swap/?outputCurrency=',
    addLiquidityUrl: 'https://wannaswap.finance/exchange/add/',
    logoFilename: 'images/protocols/wanna.png'
  }
}
