import { ChainId } from '@amaterasu-fi/sdk'

export default function getBlockchainName(chainId: ChainId | undefined): string {
  switch (chainId) {
    case ChainId.MTV_MAINNET:
      return 'MultiVAC'
    default:
      return 'Harmony'
  }
}
