// const BastionData = {
//   MAIN_COMPTROLLER: '0x6De54724e128274520606f038591A00C5E94a1F6',
//   MAIN_REWARDER: '0x98E8d4b4F53FA2a2d1b9C651AF919Fc839eE4c1a',
//   cWBTC: '0xfa786baC375D8806185555149235AcDb182C033b',
//   cETH: '0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0',
//   cNEAR: '0x8C14ea853321028a7bb5E4FB0d0147F183d3B677',
//   cUSDC: '0xe5308dc623101508952948b141fD9eaBd3337D99',
//   cUSDT: '0x845E15A441CFC1871B7AC610b0E922019BaD9826',
//   cBSTN: '0x08Ac1236ae3982EC9463EfE10F0F320d9F5A9A4b',
//
//   NEAR_COMPTROLLER: '0xE550A886716241AFB7ee276e647207D7667e1E79',
//   NEAR_REWARDER: '0xd7A812a5d2CC96e78C83B0324c82269EE82aF1c8',
//   cNEAR1: '0x4A45075D3E752F3676610Fc427F5E6915Ce63A63',
//   cstNEAR: '0xB76108eb764b4427505c4bb020A37D95b3ef5AFE',
//
//   MULTICHAIN_COMPTROLLER: '0xA195b3d7AA34E47Fb2D2e5A682DF2d9EFA2daF06',
//   MULTICHAIN_REWARDER: '0xeCa5553ed50cF52aa34c1F9242aEcfD1e7A7667F',
//   cUSDC1: '0x10a9153A7b4da83Aa1056908C710f1aaCCB3Ef85',
//   cstNEAR1: '0x30Fff4663A8DCDd9eD81e60acF505e6159f19BbC',
//
//   AURORA_COMPTROLLER: '0xe1cf09BDa2e089c63330F0Ffe3F6D6b790835973',
//   AURORA_REWARDER: '0xF9C3a8cF63154A5bD1a87b6f49575d47b7F713Bd',
//   cAURORA: '0x94FA9979751a74e6b133Eb95Aeca8565c0809BaB',
//   cUSDC2: '0x8E9FB3f2cc8b08184CB5FB7BcDC61188E80C3cB0',
//   cTRI: '0x86538Ca055E7Fd992A26c5604F349e2ede3ce42D'
// }

import { FUNCTION_SIGS } from './index'

export const cTokenSigs = [
  FUNCTION_SIGS.totalSupply,
  FUNCTION_SIGS.totalBorrows,
  FUNCTION_SIGS.supplyRatePerBlock,
  FUNCTION_SIGS.borrowRatePerBlock,
  FUNCTION_SIGS.exchangeRateStored
]

import { ChainId, Token } from '@amaterasu-fi/sdk'
import getTokenWithDefault from '../utils/getTokenWithDefault'

export interface BastionRealm {
  comptroller: string
  rewarder: string
  rewardToken0: Token
  rewardToken1: Token
}

export interface BastionPool {
  name: string
  cToken: Token
  underlying: Token
  realm: BastionRealm
}

export const BASTION_REALMS: {
  [key: string]: BastionRealm
} = {
  MAIN: {
    comptroller: '0x6De54724e128274520606f038591A00C5E94a1F6',
    rewarder: '0x98E8d4b4F53FA2a2d1b9C651AF919Fc839eE4c1a',
    rewardToken0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'),
    rewardToken1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'META')
  },
  NEAR: {
    comptroller: '0xE550A886716241AFB7ee276e647207D7667e1E79',
    rewarder: '0xd7A812a5d2CC96e78C83B0324c82269EE82aF1c8',
    rewardToken0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'),
    rewardToken1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'META')
  },
  MULTICHAIN: {
    comptroller: '0xA195b3d7AA34E47Fb2D2e5A682DF2d9EFA2daF06',
    rewarder: '0xeCa5553ed50cF52aa34c1F9242aEcfD1e7A7667F',
    rewardToken0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'),
    rewardToken1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'META')
  },
  AURORA: {
    comptroller: '0xe1cf09BDa2e089c63330F0Ffe3F6D6b790835973',
    rewarder: '0xF9C3a8cF63154A5bD1a87b6f49575d47b7F713Bd',
    rewardToken0: getTokenWithDefault(ChainId.AURORA_MAINNET, 'BSTN'),
    rewardToken1: getTokenWithDefault(ChainId.AURORA_MAINNET, 'META')
  }
}

export const BASTION_POOLS: BastionPool[] = [
  {
    name: 'NEAR (Near)',
    cToken: new Token(ChainId.AURORA_MAINNET, '0x4A45075D3E752F3676610Fc427F5E6915Ce63A63', 18, 'cNEAR', 'cNEAR'),
    underlying: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    realm: BASTION_REALMS.NEAR
  },
  {
    name: 'stNEAR (Near)',
    cToken: new Token(ChainId.AURORA_MAINNET, '0xB76108eb764b4427505c4bb020A37D95b3ef5AFE', 18, 'cstNEAR', 'cstNEAR'),
    underlying: getTokenWithDefault(ChainId.AURORA_MAINNET, 'stNEAR'),
    realm: BASTION_REALMS.NEAR
  },
  {
    name: 'USDC (Multichain)',
    cToken: new Token(ChainId.AURORA_MAINNET, '0x10a9153A7b4da83Aa1056908C710f1aaCCB3Ef85', 18, 'cstNEAR', 'cstNEAR'),
    underlying: getTokenWithDefault(ChainId.AURORA_MAINNET, 'USDC'),
    realm: BASTION_REALMS.MULTICHAIN
  },
  {
    name: 'NEAR (Multichain)',
    cToken: new Token(ChainId.AURORA_MAINNET, '0x30Fff4663A8DCDd9eD81e60acF505e6159f19BbC', 18, 'cNEAR', 'cNEAR'),
    underlying: getTokenWithDefault(ChainId.AURORA_MAINNET, 'NEAR'),
    realm: BASTION_REALMS.MULTICHAIN
  }
]
