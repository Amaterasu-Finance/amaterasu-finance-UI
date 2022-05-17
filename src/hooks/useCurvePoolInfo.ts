import { useMemo } from 'react'
import { useMultipleCallsNoInputsReturnInt } from '../state/multicall/hooks'

import { Fraction, JSBI } from '@amaterasu-fi/sdk'
import { CURVE_POOLS_MAINNET } from '../constants/curvePools'
import { FUNCTION_SIGS } from '../constants'
import { ProtocolName } from '../constants/protocol'

const WEI_DENOM = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))

export default function useCurvePoolInfo(): Record<string, any> {
  const callData = Object.keys(CURVE_POOLS_MAINNET).reduce(
    (memo, poolId) => {
      const pool = CURVE_POOLS_MAINNET[poolId]
      if (pool.isBastion) {
        return memo
      }
      memo.addresses = [...memo.addresses, pool.minterAddress]
      memo.sigs = [
        ...memo.sigs,
        pool.protocol.name == ProtocolName.TRISOLARIS ? FUNCTION_SIGS.getVirtualPrice : FUNCTION_SIGS.get_virtual_price
      ]
      memo.name = [...memo.name, pool.name]
      return memo
    },
    {
      addresses: [] as string[],
      sigs: [] as string[],
      name: [] as string[]
    }
  )

  const virtualPrices = useMultipleCallsNoInputsReturnInt(callData.addresses, callData.sigs)

  return useMemo(() => {
    return callData.name.reduce((memo, name, idx) => {
      const virtualPrice = new Fraction(JSBI.BigInt(virtualPrices[idx].result?.[0] ?? 0), WEI_DENOM)
      memo = { ...memo, [name]: virtualPrice }
      return memo
    }, {})
  }, [callData, virtualPrices])
}
