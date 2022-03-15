import { ChainId } from '@amaterasu-fi/sdk'

export default function getBlockchainName(chainId: ChainId | undefined): string {
  switch (chainId) {
    case ChainId.MTV_MAINNET:
      return 'MultiVAC'
    case ChainId.AURORA_MAINNET:
      return 'Aurora Mainnet'
    case ChainId.AURORA_TESTNET:
      return 'Aurora Testnet'
    default:
      return 'Aurora Mainnet'
  }
}
