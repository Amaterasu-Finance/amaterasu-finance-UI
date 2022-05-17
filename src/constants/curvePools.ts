import { ChainId, Token } from '@amaterasu-fi/sdk'
import getTokenWithDefault from '../utils/getTokenWithDefault'
import { Protocol, PROTOCOLS_MAINNET, ProtocolName } from './protocol'
import { BASTION_REALMS } from './bastion'

export interface CurvePool {
  name: string
  protocol: Protocol
  tokens: any[]
  baseToken: Token
  address: string
  minterAddress: string
  isCurve: boolean
  urlName: string
  stakingAddress?: string
  token0?: Token
  token1?: Token
  cTokenAddress?: string
  isBastion?: boolean
}

export const CURVE_POOLS_MAINNET: {
  [key: string]: CurvePool
} = {
  TRISOLARIS_USDC_USDT_USN: {
    name: 'USDC-USDT-USN',
    protocol: PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS],
    address: '0x87BCC091d0A7F9352728100268Ac8D25729113bB',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USN')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0x458459E48dbAC0C8Ca83F8D0b7b29FEfE60c3970',
    stakingAddress: '0x3838956710bcc9D122Dd23863a0549ca8D5675D6',
    urlName: 'https://www.trisolaris.io/#/pool/stable/add/USDC_USDT_USN',
    isCurve: true
  },
  // ---------------------------------------------------
  // Bastion
  // ---------------------------------------------------
  BASTION_MULTICHAIN_USDC: {
    name: 'USDC - Multichain Realm',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: BASTION_REALMS.MULTICHAIN.comptroller,
    stakingAddress: BASTION_REALMS.MULTICHAIN.rewarder,
    urlName: '',
    cTokenAddress: '0x10a9153A7b4da83Aa1056908C710f1aaCCB3Ef85',
    isBastion: true,
    isCurve: false
  },
  BASTION_MULTICHAIN_STNEAR: {
    name: 'stNEAR - Multichain Realm',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR'),
    minterAddress: BASTION_REALMS.MULTICHAIN.comptroller,
    stakingAddress: BASTION_REALMS.MULTICHAIN.rewarder,
    urlName: '',
    cTokenAddress: '0x30Fff4663A8DCDd9eD81e60acF505e6159f19BbC',
    isBastion: true,
    isCurve: false
  },
  BASTION_NEAR_NEAR: {
    name: 'NEAR - Near Realm',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    minterAddress: BASTION_REALMS.NEAR.comptroller,
    stakingAddress: BASTION_REALMS.NEAR.rewarder,
    urlName: '',
    cTokenAddress: '0x4A45075D3E752F3676610Fc427F5E6915Ce63A63',
    isBastion: true,
    isCurve: false
  },
  BASTION_NEAR_STNEAR: {
    name: 'stNEAR - Near Realm',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR'),
    minterAddress: BASTION_REALMS.NEAR.comptroller,
    stakingAddress: BASTION_REALMS.NEAR.rewarder,
    urlName: '',
    cTokenAddress: '0xB76108eb764b4427505c4bb020A37D95b3ef5AFE',
    isBastion: true,
    isCurve: false
  },
  BASTION_MAIN_USDC: {
    name: 'USDC - Main Hub',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: BASTION_REALMS.MAIN.comptroller,
    stakingAddress: BASTION_REALMS.MAIN.rewarder,
    urlName: '',
    cTokenAddress: '0xe5308dc623101508952948b141fD9eaBd3337D99',
    isBastion: true,
    isCurve: false
  },
  BASTION_MAIN_USDT: {
    name: 'USDT - Main Hub',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
    minterAddress: BASTION_REALMS.MAIN.comptroller,
    stakingAddress: BASTION_REALMS.MAIN.rewarder,
    urlName: '',
    cTokenAddress: '0x845E15A441CFC1871B7AC610b0E922019BaD9826',
    isBastion: true,
    isCurve: false
  },
  BASTION_MAIN_WBTC: {
    name: 'WBTC - Main Hub',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WBTC').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'WBTC')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WBTC'),
    minterAddress: BASTION_REALMS.MAIN.comptroller,
    stakingAddress: BASTION_REALMS.MAIN.rewarder,
    urlName: '',
    cTokenAddress: '0xfa786baC375D8806185555149235AcDb182C033b',
    isBastion: true,
    isCurve: false
  },
  BASTION_MAIN_WETH: {
    name: 'WETH - Main Hub',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'WETH'),
    minterAddress: BASTION_REALMS.MAIN.comptroller,
    stakingAddress: BASTION_REALMS.MAIN.rewarder,
    urlName: '',
    cTokenAddress: '0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0',
    isBastion: true,
    isCurve: false
  },
  BASTION_MAIN_NEAR: {
    name: 'NEAR - Main Hub',
    protocol: PROTOCOLS_MAINNET[ProtocolName.BASTION],
    address: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR').address,
    tokens: [getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR')],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    minterAddress: BASTION_REALMS.MAIN.comptroller,
    stakingAddress: BASTION_REALMS.MAIN.rewarder,
    urlName: '',
    cTokenAddress: '0x8C14ea853321028a7bb5E4FB0d0147F183d3B677',
    isBastion: true,
    isCurve: false
  },
  // ---------------------------------------------------
  // Rose
  // ---------------------------------------------------
  ROSE_DAI_USDC_USDT: {
    name: 'DAI-USDC-USDT',
    protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
    address: '0xfF79D5bff48e1C01b722560D6ffDfCe9FC883587',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'DAI'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0xc90dB0d8713414d78523436dC347419164544A3f',
    stakingAddress: '0x52CACa9a2D52b27b28767d3649565774A3B991f3',
    urlName: 'stables',
    isCurve: true
  },
  ROSE_DAI_USDC_USDT_RUSD: {
    name: 'DAI-USDC-USDT-RUSD',
    protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
    address: '0x56f87a0cB4713eB513BAf57D5E81750433F5fcB9',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'DAI'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'RUSD')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0x79B0a67a4045A7a8DC04b17456F4fe15339cBA34',
    stakingAddress: '0x9286d58C1c8d434Be809221923Cf4575f7A4d058',
    urlName: 'rusd',
    isCurve: true
  },
  ROSE_DAI_USDC_USDT_FRAX: {
    name: 'DAI-USDC-USDT-FRAX',
    protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
    address: '0x4463A118A2fB34640ff8eF7Fe1B3abAcd4aC9fB7',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'DAI'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'FRAX')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0xa34315F1ef49392387Dd143f4578083A9Bd33E94',
    stakingAddress: '0xB9D873cDc15e462f5414CCdFe618a679a47831b4',
    urlName: 'frax',
    isCurve: true
  },
  ROSE_DAI_USDC_USDT_UST: {
    name: 'DAI-USDC-USDT-UST',
    protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
    address: '0x94A7644E4D9CA0e685226254f88eAdc957D3c263',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'DAI'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'atUST')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0x8fe44f5cce02D5BE44e3446bBc2e8132958d22B8',
    stakingAddress: '0x56DE5E2c25828040330CEF45258F3FFBc090777C',
    urlName: 'ust',
    isCurve: true
  },
  ROSE_DAI_USDC_USDT_MAI: {
    name: 'DAI-USDC-USDT-MAI',
    protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
    address: '0xA7ae42224Bf48eCeFc5f838C230EE339E5fd8e62',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'DAI'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'MAI')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0x65a761136815B45A9d78d9781d22d47247B49D23',
    stakingAddress: '0x226991aADeEfDe03bF557eF067da95fc613aBfFc',
    urlName: 'mai',
    isCurve: true
  },
  ROSE_DAI_USDC_USDT_BUSD: {
    name: 'DAI-USDC-USDT-BUSD',
    protocol: PROTOCOLS_MAINNET[ProtocolName.ROSE],
    address: '0x158f57CF9A4DBFCD1Bc521161d86AeCcFC5aF3Bc',
    tokens: [
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'DAI'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDT'),
      getTokenWithDefault(ChainId.AURORA_MAINNET, 'BUSD')
    ],
    baseToken: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    minterAddress: '0xD6cb7Bb7D63f636d1cA72A1D3ed6f7F67678068a',
    stakingAddress: '0x18A6115150A060F22Bacf62628169ee9b231368f',
    urlName: 'busd',
    isCurve: true
  }
}
