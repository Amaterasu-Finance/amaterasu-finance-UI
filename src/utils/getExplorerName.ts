import { Blockchain } from '@amaterasu-fi/sdk'

export default function getExplorerName(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return 'BSCScan'
    case Blockchain.MTV:
      return 'MTV Explorer'
    default:
      return 'Etherscan'
  }
}
