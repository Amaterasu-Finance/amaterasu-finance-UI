import { Blockchain } from '@amaterasu-fi/sdk'

// Returns the block time in seconds
export default function getBlockchainBlockTime(blockchain: Blockchain): number {
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return 3
    case Blockchain.MTV:
      return 4
    default:
      return 13
  }
}
