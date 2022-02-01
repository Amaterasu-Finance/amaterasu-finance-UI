import { Blockchain, ChainId } from '@amaterasu-fi/sdk'

export default function getBlockchain(chainId: ChainId | undefined): Blockchain {
  switch (chainId) {
    case ChainId.MTV_MAINNET:
      return Blockchain.MTV
    default:
      return Blockchain.MTV
  }
}
