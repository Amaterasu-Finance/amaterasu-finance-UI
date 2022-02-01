import { Blockchain } from '@amaterasu-fi/sdk'
import useBlockchain from './useBlockchain'

export default function usePlatformName(): string {
  const blockchain = useBlockchain()
  switch (blockchain) {
    case Blockchain.MTV:
      return 'Amaterasu'
    case Blockchain.ETHEREUM:
      return 'Amaterasu'
    default:
      return 'Amaterasu'
  }
}
