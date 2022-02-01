import { ChainId, Token } from '@amaterasu-fi/sdk'
// import getPairTokensWithDefaults from '../utils/getPairTokensWithDefaults'
// import getTokenWithDefault from '../utils/getTokenWithDefault'

export const BONDS: {
  [chainId in ChainId]?: {
    name: string
    isLpBond?: boolean
    displayName: string
    bondToken: [Token, Token] | Token
    rewardToken: Token | undefined
    bondAddress: string
  }[]
} = {
  [ChainId.MTV_MAINNET]: []
}
