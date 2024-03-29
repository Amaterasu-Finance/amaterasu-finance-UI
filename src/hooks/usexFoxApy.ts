import { Fraction, JSBI } from '@amaterasu-fi/sdk'
import { useActiveWeb3React } from '.'
import { useGovTokenContract, useMasterBreederContract } from './useContract'
import getBlocksPerYear from '../utils/getBlocksPerYear'
import { useSingleCallResult } from '../state/multicall/hooks'

export default function useXFoxApy() {
  const { chainId } = useActiveWeb3React()
  const masterBreederContract = useMasterBreederContract()
  const govTokenContract = useGovTokenContract()

  const blocksPerYear = getBlocksPerYear(chainId)
  const baseBlockRewards = new Fraction(BigInt(25), BigInt(1000)) // 0.025 per second

  const poolRewardsPerBlock = useSingleCallResult(masterBreederContract, 'poolInfo', [0])
  const totalAllocPoints = useSingleCallResult(masterBreederContract, 'totalAllocPoint')
  const govTokenMasterchefBalance = useSingleCallResult(govTokenContract, 'balanceOf', [masterBreederContract?.address])

  const govTokenMasterchefBalanceResult = govTokenMasterchefBalance.result
    ? BigInt(govTokenMasterchefBalance.result)
    : BigInt(0)
  if (govTokenMasterchefBalanceResult < 0) {
    return { apyDay: 0, apy: 0 }
  }
  const nCompounds = 3000
  const poolShare =
    poolRewardsPerBlock.result &&
    totalAllocPoints.result &&
    new Fraction(BigInt(poolRewardsPerBlock.result?.allocPoint), BigInt(totalAllocPoints.result))
  const rewardsPerCompound =
    poolShare &&
    poolShare
      .multiply(baseBlockRewards)
      .multiply(blocksPerYear)
      .divide(BigInt(nCompounds))
      .multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)))
  const aprDay =
    rewardsPerCompound &&
    govTokenMasterchefBalanceResult > 0 &&
    rewardsPerCompound.divide(govTokenMasterchefBalanceResult)

  const apyDay = aprDay ? (Number(aprDay?.add(JSBI.BigInt(1)).toFixed(10)) ** (nCompounds / 365) - 1) * 100 : 0
  const apy = aprDay ? (Number(aprDay?.add(JSBI.BigInt(1)).toFixed(10)) ** nCompounds - 1) * 100 : 0
  return { apyDay, apy }
}

export function useXFoxApr(): undefined | Fraction {
  const { chainId } = useActiveWeb3React()
  const masterBreederContract = useMasterBreederContract()
  const govTokenContract = useGovTokenContract()

  const blocksPerYear = getBlocksPerYear(chainId)
  const baseBlockRewards = new Fraction(BigInt(25), BigInt(1000)) // 0.025 per second

  const poolRewardsPerBlock = useSingleCallResult(masterBreederContract, 'poolInfo', [0])
  const totalAllocPoints = useSingleCallResult(masterBreederContract, 'totalAllocPoint')
  const govTokenMasterchefBalance = useSingleCallResult(govTokenContract, 'balanceOf', [masterBreederContract?.address])

  const govTokenMasterchefBalanceResult = govTokenMasterchefBalance.result
    ? BigInt(govTokenMasterchefBalance.result)
    : BigInt(0)
  if (govTokenMasterchefBalanceResult <= 0) {
    return new Fraction('0', '1')
  }
  const poolShare =
    poolRewardsPerBlock.result &&
    totalAllocPoints.result &&
    new Fraction(BigInt(poolRewardsPerBlock.result?.allocPoint), BigInt(totalAllocPoints.result))
  const rewardsPerYear =
    poolShare &&
    poolShare
      .multiply(blocksPerYear)
      .multiply(baseBlockRewards)
      .multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)))
  return rewardsPerYear && rewardsPerYear.divide(govTokenMasterchefBalanceResult)
}
