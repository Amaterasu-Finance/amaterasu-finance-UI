import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, JSBI, Percent, Token, WETH } from '@amaterasu-fi/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected, portis, walletconnect, walletlink } from '../connectors'

import getTokenWithDefault from '../utils/getTokenWithDefault'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_ONE_ADDRESS = '0x0000000000000000000000000000000000000001'
export const BONDING_ADDRESS = '0x42b769209eC38286b858Ae2d919Cd111b12975FE'
export const GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
export const TIMELOCK_ADDRESS = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'
export const SOCKS_TESTNET_ADDRESS = '0x65770b5283117639760beA3F867b69b3697a91dd'

export const ROUTER_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MTV_MAINNET]: '0xfee8B01BdB8354ac730D4b28F500e70384158b10',
  [ChainId.AURORA_MAINNET]: '0x96D2A794b8efaF01EA1975D5557f4028393f2a35',
  [ChainId.AURORA_TESTNET]: '0x96D2A794b8efaF01EA1975D5557f4028393f2a35'
}

export const PAYOUT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MTV_MAINNET]: '0x41705A23De7517D931D1967c13B5696a71279ff1',
  [ChainId.AURORA_MAINNET]: '0x39CeFDd2ED8E8bD62f893810A0E2E75A6C0d9E15',
  [ChainId.AURORA_TESTNET]: '0x39CeFDd2ED8E8bD62f893810A0E2E75A6C0d9E15'
}

export const GOVERNANCE_TOKEN: { [chainId in ChainId]: Token } = {
  [ChainId.MTV_MAINNET]: new Token(
    ChainId.MTV_MAINNET,
    '0x045d0bc9E3cFF68fAeB3a9285239B4c095Dd2cdd',
    18,
    'IZA',
    'IZA Token'
  ),
  [ChainId.AURORA_MAINNET]: new Token(
    ChainId.AURORA_MAINNET,
    '0xb82A2B57828f1127062A3B35aC470D2F55FF5eCD',
    18,
    'IZA',
    'IZA Token'
  ),
  [ChainId.AURORA_TESTNET]: new Token(
    ChainId.AURORA_TESTNET,
    '0xb82A2B57828f1127062A3B35aC470D2F55FF5eCD',
    18,
    'IZA',
    'IZA Token'
  )
}

export const MASTER_BREEDER: { [chainId in ChainId]: string } = {
  [ChainId.MTV_MAINNET]: '0x701294Ca6FAb80319abD74F3790D17F7F9c45FA1',
  [ChainId.AURORA_MAINNET]: '0x3F3b5104C0c86316d2442F01bEc3EeEc30d6d14f',
  [ChainId.AURORA_TESTNET]: '0x3F3b5104C0c86316d2442F01bEc3EeEc30d6d14f'
}

export const PIT_BREEDER: { [chainId in ChainId]: string } = {
  [ChainId.MTV_MAINNET]: '0x02Dd0Aba3734B270436753550d9365ac85BA7f14',
  [ChainId.AURORA_MAINNET]: '0x87eFA71742Eb78724F23AF3Af1c0C8A918cf6BFF',
  [ChainId.AURORA_TESTNET]: '0x87eFA71742Eb78724F23AF3Af1c0C8A918cf6BFF'
}

export const PIT: { [chainId in ChainId]: Token } = {
  [ChainId.MTV_MAINNET]: new Token(
    ChainId.MTV_MAINNET,
    '0x214C6dA089B3fdA57d39a8E1bFF01ef27a4C62FA',
    18,
    'xIZA',
    'Staked IZA'
  ),
  [ChainId.AURORA_MAINNET]: new Token(
    ChainId.AURORA_MAINNET,
    '0x19d8db04e69358F7211E4cf4e56F938101382556',
    18,
    'xIZA',
    'Staked IZA'
  ),
  [ChainId.AURORA_TESTNET]: new Token(
    ChainId.AURORA_TESTNET,
    '0x19d8db04e69358F7211E4cf4e56F938101382556',
    18,
    'xIZA',
    'Staked IZA'
  )
}

export const PIT_SETTINGS: { [chainId in ChainId]: Record<string, string> } = {
  [ChainId.MTV_MAINNET]: { name: 'Stake', path: '/stake' },
  [ChainId.AURORA_MAINNET]: { name: 'Stake', path: '/stake' },
  [ChainId.AURORA_TESTNET]: { name: 'Stake', path: '/stake' }
}

export const WEB_INTERFACES: { [chainId in ChainId]: string[] } = {
  [ChainId.MTV_MAINNET]: ['amaterasu.finance', 'swap.amaterasu.finance'],
  [ChainId.AURORA_MAINNET]: ['amaterasu.finance', 'swap.amaterasu.finance'],
  [ChainId.AURORA_TESTNET]: ['amaterasu.finance', 'swap.amaterasu.finance']
}

export { PRELOADED_PROPOSALS } from './proposals'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 2
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock'
}

export const FALLBACK_GAS_LIMIT = BigNumber.from(6721900)

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MTV_MAINNET]: [WETH[ChainId.MTV_MAINNET]],
  [ChainId.AURORA_MAINNET]: [WETH[ChainId.AURORA_MAINNET]],
  [ChainId.AURORA_TESTNET]: [WETH[ChainId.AURORA_TESTNET]]
}

export const IZA = getTokenWithDefault(ChainId.AURORA_TESTNET, 'IZA')
export const NEAR = getTokenWithDefault(ChainId.AURORA_TESTNET, 'NEAR')
export const USDC = getTokenWithDefault(ChainId.AURORA_TESTNET, 'USDC')

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MTV_MAINNET]: [WETH[ChainId.MTV_MAINNET], IZA, USDC],
  [ChainId.AURORA_MAINNET]: [WETH[ChainId.AURORA_MAINNET], IZA, NEAR, USDC],
  [ChainId.AURORA_TESTNET]: [WETH[ChainId.AURORA_TESTNET], IZA, NEAR, USDC]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.MTV_MAINNET]: [WETH[ChainId.MTV_MAINNET], IZA, USDC],
  [ChainId.AURORA_MAINNET]: [WETH[ChainId.AURORA_MAINNET], IZA, USDC, NEAR],
  [ChainId.AURORA_TESTNET]: [WETH[ChainId.AURORA_TESTNET], IZA, USDC, NEAR]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MTV_MAINNET]: [IZA, ...WETH_ONLY[ChainId.MTV_MAINNET], USDC],
  [ChainId.AURORA_MAINNET]: [IZA, ...WETH_ONLY[ChainId.AURORA_MAINNET], USDC, NEAR],
  [ChainId.AURORA_TESTNET]: [IZA, ...WETH_ONLY[ChainId.AURORA_TESTNET], USDC, NEAR]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MTV_MAINNET]: [[USDC, WETH[ChainId.MTV_MAINNET]]],
  [ChainId.AURORA_MAINNET]: [[USDC, WETH[ChainId.AURORA_MAINNET]]],
  [ChainId.AURORA_TESTNET]: [[USDC, WETH[ChainId.AURORA_TESTNET]]]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C'
]
