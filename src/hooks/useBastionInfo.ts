import { useMemo } from 'react'
import { useMultipleCallsNoInputsReturnInt, useMultipleContractMultipleData } from '../state/multicall/hooks'
import { BASTION_POOLS, BastionRealm, cTokenSigs } from '../constants/bastion'
import rewarderAbi from 'constants/abis/bastionRewarder.json'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { Fraction, JSBI, Price, Token, TokenAmount } from '@amaterasu-fi/sdk'

const WEI_DENOM = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
type MethodArg = string | number | BigNumber
type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined
const REWARDER_INTERFACE = new Interface(rewarderAbi)

export interface BastionInfo {
  name: string
  cToken: Token
  underlying: Token
  realm: BastionRealm
  totalSupply: Fraction | undefined
  totalBorrows: Fraction | undefined
  supplyRatePerBlock: Fraction | undefined
  borrowRatePerBlock: Fraction | undefined
  exchangeRateStored: Fraction | undefined
  rewardSupplySpeeds0: TokenAmount | undefined
  rewardBorrowSpeeds0: TokenAmount | undefined
  rewardSupplySpeeds1: TokenAmount | undefined
  rewardBorrowSpeeds1: TokenAmount | undefined
  tvlUsd: Fraction | undefined
  underlyingPrice: Fraction | undefined
  supplyAprDaily: number
  borrowAprDaily: number
  supplyAprDailyBase: Fraction | undefined
  borrowAprDailyBase: Fraction | undefined
}

export function getTokenPrice(token: Token | undefined, tokenData: Record<string, any>): Price | undefined {
  if (token && token?.symbol === 'NEAR') {
    return tokenData?.NEARUSD?.price
  } else if (token && token?.symbol === 'ETH') {
    return tokenData?.WETHUSD?.price
  } else if (token?.symbol && ['USDC', 'USDT'].includes(token.symbol)) {
    return new Price(token, token, '1', '1')
  }
  return token && token?.symbol && tokenData?.[token?.symbol]?.price
}

export default function useBastionInfo(tokensWithPrices: Record<string, any>): BastionInfo[] {
  const blocksPerDay = JSBI.BigInt(84600) // blocks per year @ 1.0s/block
  const poolCallData = BASTION_POOLS.reduce(
    (memo, pool) => {
      memo.addresses = [...memo.addresses, ...Array(5).fill(pool.cToken.address)]
      memo.sigs = [...memo.sigs, ...cTokenSigs]
      return memo
    },
    {
      addresses: [] as string[],
      sigs: [] as string[]
    }
  )
  const rewarderCallData = BASTION_POOLS.reduce(
    (memo, pool) => {
      memo.addresses = [...memo.addresses, pool.realm.rewarder, pool.realm.rewarder]
      memo.interfaces = [...memo.interfaces, REWARDER_INTERFACE, REWARDER_INTERFACE]
      memo.callInputs = [...memo.callInputs, [0, pool.cToken.address], [1, pool.cToken.address]]
      return memo
    },
    {
      addresses: [] as string[],
      interfaces: [] as Interface[],
      callInputs: [] as OptionalMethodInputs[]
    }
  )

  const cTokenData = useMultipleCallsNoInputsReturnInt(poolCallData.addresses, poolCallData.sigs)
  const rewarderSupplyData = useMultipleContractMultipleData(
    rewarderCallData.addresses,
    rewarderCallData.interfaces,
    'rewardSupplySpeeds',
    rewarderCallData.callInputs
  )
  const rewarderBorrowData = useMultipleContractMultipleData(
    rewarderCallData.addresses,
    rewarderCallData.interfaces,
    'rewardBorrowSpeeds',
    rewarderCallData.callInputs
  )

  return useMemo(() => {
    return BASTION_POOLS.reduce<BastionInfo[]>((memo, pool, index) => {
      const offset5 = index * 5
      const offset2 = index * 2

      const totalSupply = new Fraction(JSBI.BigInt(cTokenData[offset5].result?.[0] ?? 0))
      const totalBorrows = new TokenAmount(pool.underlying, JSBI.BigInt(cTokenData[offset5 + 1].result?.[0] ?? 0))
      const supplyRatePerBlock = new Fraction(JSBI.BigInt(cTokenData[offset5 + 2].result?.[0] ?? 0))
      const borrowRatePerBlock = new Fraction(JSBI.BigInt(cTokenData[offset5 + 3].result?.[0] ?? 0))
      const exchangeRateStored = new Fraction(JSBI.BigInt(cTokenData[offset5 + 4].result?.[0] ?? 0))

      const underlyingPrice = getTokenPrice(pool.underlying, tokensWithPrices)
      const tvl = new TokenAmount(
        pool.underlying,
        totalSupply
          .multiply(exchangeRateStored)
          .divide(WEI_DENOM)
          .toFixed(0)
      )
      const tvlUsd = underlyingPrice?.adjusted ? tvl.multiply(underlyingPrice.adjusted) : tvl
      const tvlBorrowUsd = underlyingPrice?.adjusted ? totalBorrows.multiply(underlyingPrice.adjusted) : totalBorrows

      const rewardSupplySpeeds0 = new TokenAmount(
        pool.realm.rewardToken0,
        JSBI.BigInt(rewarderSupplyData[offset2].result?.[0] ?? 0)
      )
      const rewardSupplySpeeds1 = new TokenAmount(
        pool.realm.rewardToken1,
        JSBI.BigInt(rewarderSupplyData[offset2 + 1].result?.[0] ?? 0)
      )
      const rewardBorrowSpeeds0 = new TokenAmount(
        pool.realm.rewardToken0,
        JSBI.BigInt(rewarderBorrowData[offset2].result?.[0] ?? 0)
      )
      const rewardBorrowSpeeds1 = new TokenAmount(
        pool.realm.rewardToken1,
        JSBI.BigInt(rewarderBorrowData[offset2 + 1].result?.[0] ?? 0)
      )

      // supplyAPR daily = supplyAprDaily + (rewards daily / totalSupply)
      const bstnPrice = tokensWithPrices?.BSTN?.price
      const metaPrice = tokensWithPrices?.META?.price
      const supplyBaseAprDaily = supplyRatePerBlock.multiply(blocksPerDay).divide(WEI_DENOM)
      const supplyRewardAprDaily0 =
        tvlUsd && tvlUsd.greaterThan('0')
          ? rewardSupplySpeeds0
              .multiply(blocksPerDay)
              .multiply(bstnPrice?.adjusted ?? '0')
              .divide(tvlUsd)
          : new Fraction('0')
      const supplyRewardAprDaily1 =
        tvlUsd && tvlUsd.greaterThan('0')
          ? rewardSupplySpeeds1
              .multiply(blocksPerDay)
              .multiply(metaPrice?.adjusted ?? '0')
              .divide(tvlUsd)
          : new Fraction('0')

      const borrowBaseAprDaily = borrowRatePerBlock.multiply(blocksPerDay).divide(WEI_DENOM)
      const borrowRewardAprDaily0 =
        tvlBorrowUsd && tvlBorrowUsd.greaterThan('0')
          ? rewardBorrowSpeeds0
              .multiply(blocksPerDay)
              .multiply(bstnPrice?.adjusted ?? '0')
              .divide(tvlBorrowUsd)
          : new Fraction('0')
      const borrowRewardAprDaily1 =
        tvlBorrowUsd && tvlBorrowUsd.greaterThan('0')
          ? rewardBorrowSpeeds1
              .multiply(blocksPerDay)
              .multiply(metaPrice?.adjusted ?? '0')
              .divide(tvlBorrowUsd)
          : new Fraction('0')

      const totalSupplyAprDaily = Number(
        supplyBaseAprDaily
          .add(supplyRewardAprDaily0)
          .add(supplyRewardAprDaily1)
          .toSignificant(10)
      )

      // console.log('---------------------------------')
      // console.log(pool.name)
      // console.log('borrowBaseAprDaily', borrowBaseAprDaily.toSignificant(10))
      // console.log('tvlUsd', tvlUsd.toSignificant(10))
      // console.log('tvlBorrowUsd', tvlBorrowUsd.toSignificant(10))
      // console.log('rewardBorrowSpeeds0', rewardBorrowSpeeds0.toSignificant(10))
      // console.log('borrowRewardAprDaily0', borrowRewardAprDaily0.toSignificant(10))
      // console.log('borrowRewardAprDaily1', borrowRewardAprDaily1.toSignificant(10))
      // console.log('---------------------------------')
      const totalBorrowAprDaily =
        Number(borrowRewardAprDaily0.add(borrowRewardAprDaily1).toSignificant(10)) -
        Number(borrowBaseAprDaily.toSignificant(10))

      const poolInfo = {
        name: pool.name,
        cToken: pool.cToken,
        underlying: pool.underlying,
        realm: pool.realm,
        totalSupply: tvl,
        totalBorrows: totalBorrows,
        supplyRatePerBlock: supplyRatePerBlock,
        borrowRatePerBlock: borrowRatePerBlock,
        exchangeRateStored: exchangeRateStored,
        rewardSupplySpeeds0: rewardSupplySpeeds0,
        rewardSupplySpeeds1: rewardSupplySpeeds1,
        rewardBorrowSpeeds0: rewardBorrowSpeeds0,
        rewardBorrowSpeeds1: rewardBorrowSpeeds1,
        tvlUsd: tvlUsd,
        underlyingPrice: underlyingPrice?.adjusted,
        supplyAprDailyBase: supplyBaseAprDaily,
        borrowAprDailyBase: borrowBaseAprDaily,
        supplyAprDaily: totalSupplyAprDaily,
        borrowAprDaily: totalBorrowAprDaily
      }
      memo.push(poolInfo)
      return memo
    }, [])
  }, [BASTION_POOLS, tokensWithPrices, cTokenData, rewarderSupplyData, rewarderBorrowData])
}

export function getBastionInfoFromcToken(
  cTokenAddress: string | undefined,
  infos: BastionInfo[]
): BastionInfo | undefined {
  return infos.find(f => f.cToken.address === cTokenAddress)
}
