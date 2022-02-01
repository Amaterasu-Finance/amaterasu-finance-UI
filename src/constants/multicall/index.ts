import { ChainId } from '@amaterasu-fi/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MTV_MAINNET]: '0x27FD914c884234449ff5CBfA9E6D2faD3c8e8D0b'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
