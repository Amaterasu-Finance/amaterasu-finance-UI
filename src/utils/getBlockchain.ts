import { Blockchain, ChainId } from '@amaterasu-fi/sdk'

export default function getBlockchain(chainId: ChainId | undefined): Blockchain {
  switch (chainId) {
    case ChainId.MTV_MAINNET:
      return Blockchain.MTV
    case ChainId.AURORA_MAINNET:
      return Blockchain.AURORA_MAINNET
    case ChainId.AURORA_TESTNET:
      return Blockchain.AURORA_TESTNET
    default:
      return Blockchain.AURORA_MAINNET
  }
}
