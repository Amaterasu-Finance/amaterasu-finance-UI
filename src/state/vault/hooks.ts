import { CurrencyAmount, JSBI, Token, TokenAmount, Fraction, Price } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useSingleContractMultipleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { useMasterchefContract, useVaultChefContract } from '../../hooks/useContract'
import { useMultipleContractSingleData, useMultipleCallsNoInputsReturnInt } from '../../state/multicall/hooks'
import { abi as IUniswapV2PairABI } from '@foxswap/core/build/IUniswapV2Pair.json'
import stratABI from '../../constants/abis/strat.json'
import { Interface } from '@ethersproject/abi'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import useTokensWithWethPrices from '../../hooks/useTokensWithWETHPrices'
import useBUSDPrice from '../../hooks/useBUSDPrice'
import useFilterVaultRewardsInfo from '../../hooks/useFilterVaultRewardsInfo'
import calculateWethAdjustedTotalStakedAmount from '../../utils/calculateWethAdjustedTotalStakedAmount'
import calculateApr from '../../utils/calculateApr'
import validStakingInfo from '../../utils/validStakingInfo'
// import determineBaseToken from '../../utils/determineBaseToken'
import { LiqPool } from '../../constants/lps'
import usePitToken from '../../hooks/usePitToken'
import { ProtocolName, PROTOCOLS_MAINNET } from '../../constants/protocol'
import calculateApy from '../../utils/calculateApy'
import { useXFoxApr } from '../../hooks/usexFoxApy'

const TOTAL_ALLOC_POINT_SIG = '0x17caf6f1'
const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)
const STRAT_INTERFACE = new Interface(stratABI)

// const BLOCKS_PER_YEAR_11 = 28669090 // blocks per year @ 1.1s
// const BLOCKS_PER_YEAR_10 = 31449600 // blocks per year @ 1.0s

const DEFAULT_CONTROLLER_FEE = 1.0
const DEFAULT_BUYBACK_RATE = 3.0
const DEFAULT_XIZA_RATE = 20.0
const DEFAULT_XTOKEN_RATE = 0.0
const DEFAULT_WITHDRAW_FEE = 0.1

export const REWARDS_DURATION_DAYS = 60
export interface VaultsInfo {
  pid: number
  farmPid: number
  active: boolean
  tokens: [Token, Token]
  lp: LiqPool
  masterchef?: string // masterchef address for rewards info
  buybackRate?: number // buy+burn IZA %, default = 3%
  xIzaRate?: number // xIZA % of rewards, default = 20%
  xTokenRate?: number // xToken %, default = 0%
  compoundRate?: number // xToken %, default = 0%
  withdrawFee?: number // withdraw fee, default = 0.1%
  // baseToken used for TVL & APR calculations
  baseToken: Token | undefined
  // the allocation point for the given pool
  allocPoint: JSBI
  // base rewards per block
  baseRewardsPerBlock: TokenAmount
  // pool specific rewards per block
  poolRewardsPerBlock: Fraction
  // blocks generated per year
  blocksPerYear: JSBI
  // pool share vs all pools
  poolShare: Fraction
  // the total supply of lp tokens in existence
  totalLpTokenSupply: TokenAmount
  // the amount of currently total staked tokens in the pool
  totalStakedAmount: TokenAmount
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of token currently staked, or undefined if no account
  stakedAmountUsd: Fraction | undefined
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountxIza: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountxToken: TokenAmount
  // value of total staked amount, measured in a USD stable coin (busd, usdt, usdc or a mix thereof)
  valueOfTotalStakedAmountInUsd: Fraction | undefined
  // price per LP token
  pricePerLpToken: Fraction | undefined
  // pool APR
  apr: Fraction | undefined
  // pool APY
  apy: number | undefined
}

export function getRewardTokenPrice(baseToken: Token | undefined, tokenData: Record<string, any>): Price | undefined {
  return baseToken && baseToken?.symbol && tokenData?.[baseToken?.symbol].price
}

export function getIzaApy20Perc(baseApr: Fraction, basexIzaApr: Fraction): number | undefined {
  const ratio =
    0.0179 +
    0.00214 * Number(baseApr.toSignificant(10)) * 100 +
    0.0000172 * Math.pow(Number(baseApr.toSignificant(10)) * 100, 2)
  return ratio * Number(basexIzaApr.toSignificant(10))
}

// gets the staking info from the network for the active chain id
export function useVaultsInfo(active: boolean | undefined = undefined, pid?: number | null): VaultsInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const vaultChefContract = useVaultChefContract()

  const vaultInfo = useFilterVaultRewardsInfo(chainId, active, pid)
  const xIzaApr = useXFoxApr()

  const tokensWithPrices = useTokensWithWethPrices()

  const weth = tokensWithPrices?.WETH?.token
  const wethBusdPrice = useBUSDPrice(weth)
  const govToken = tokensWithPrices?.govToken?.token
  const govTokenWETHPrice = tokensWithPrices?.govToken?.price
  const xToken = usePitToken()

  // const blocksPerYear = JSBI.BigInt(28669090) // blocks per year @ 1.1s/block
  const blocksPerYear = JSBI.BigInt(31449600) // blocks per year @ 1.0s/block

  const pids = useMemo(() => vaultInfo.map(({ pid }) => pid), [vaultInfo])
  const farmPids = useMemo(() => vaultInfo.map(({ farmPid }) => farmPid), [vaultInfo])
  const lpTokenAddresses = useMemo(() => vaultInfo.map(({ lp }) => lp.address), [vaultInfo])
  const stratAddresses = useMemo(() => vaultInfo.map(({ stratAddress }) => stratAddress), [vaultInfo])

  const pidAccountMapping = useMemo(
    () => vaultInfo.map(({ pid }) => (account ? [pid, account] : [undefined, undefined])),
    [vaultInfo, account]
  )

  const pendingRewards = useSingleContractMultipleData(vaultChefContract, 'pendingRewards', pidAccountMapping)
  const userInfos = useSingleContractMultipleData(vaultChefContract, 'stakedWantTokens', pidAccountMapping)
  const vaultBalances = useMultipleContractSingleData(stratAddresses, STRAT_INTERFACE, 'wantLockedTotal')

  const triMasterchefV1 = useMasterchefContract(PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].masterchefV1)
  // TODO - need to add each masterchef here and call 2 functions: rewardPerBlock and totalAllocPoint
  const chefData = useMultipleCallsNoInputsReturnInt(
    [triMasterchefV1?.address, triMasterchefV1?.address],
    [PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].perBlockFunctionSig, TOTAL_ALLOC_POINT_SIG]
  )

  // TODO - need to do this for each underlying farm... triV2, wannaV1, wannaV2, ...
  const poolInfos = useSingleContractMultipleData(
    triMasterchefV1,
    'poolInfo',
    farmPids.map(pid => [pid])
  )

  const lpTokenTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'totalSupply')
  const lpTokenReserves = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'getReserves')
  const lpTokenBalances = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'balanceOf', [
    triMasterchefV1?.address
  ])

  return useMemo(() => {
    // console.log(new Date().toLocaleString(), 'fetchVaults memo')
    if (!chainId || !weth || !govToken || !xToken) return []

    return pids.reduce<VaultsInfo[]>((memo, pid, index) => {
      const tokens = vaultInfo[index].tokens
      const farmPid = vaultInfo[index].farmPid
      const lp = vaultInfo[index].lp
      const masterchefAddress = vaultInfo[index].masterchef
      const buybackRate = vaultInfo[index].buybackRate ?? DEFAULT_BUYBACK_RATE
      const xIzaRate = vaultInfo[index].xIzaRate ?? DEFAULT_XIZA_RATE
      const xTokenRate = vaultInfo[index].xTokenRate ?? DEFAULT_XTOKEN_RATE
      const withdrawFee = vaultInfo[index].withdrawFee ?? DEFAULT_WITHDRAW_FEE
      const poolInfo = poolInfos[index]
      const compoundRate = 100 - DEFAULT_CONTROLLER_FEE - buybackRate - xIzaRate - xTokenRate

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const pendingReward = pendingRewards[index]
      const lpTokenTotalSupply = lpTokenTotalSupplies[index]
      const lpTokenReserve = lpTokenReserves[index]
      const lpTokenBalance = lpTokenBalances[index]
      const vaultBalance = vaultBalances[index]

      const rewardPerBlock = chefData[0]
      const totalAllocPoint = chefData[1]

      if (
        validStakingInfo(
          tokens,
          poolInfo,
          pendingReward,
          userInfo,
          lpTokenTotalSupply,
          lpTokenReserve,
          lpTokenBalance,
          rewardPerBlock,
          totalAllocPoint
        )
      ) {
        const poolInfoResult = poolInfo.result
        const totalAllocPointResult = JSBI.BigInt(totalAllocPoint.result?.[0] ?? 1)
        const allocPoint = JSBI.BigInt(poolInfoResult && poolInfoResult[1])
        const active = poolInfoResult && JSBI.GE(JSBI.BigInt(allocPoint), 0) ? true : false
        const baseRewardsPerBlock = JSBI.BigInt(rewardPerBlock.result?.[0] ?? 0)

        const poolShare = new Fraction(allocPoint, totalAllocPointResult)

        // TODO - fallback to gov token even though it's dumb
        const baseBlockRewards = new TokenAmount(lp.protocol.nativeToken ?? govToken, baseRewardsPerBlock)
        const poolBlockRewards = baseBlockRewards && baseBlockRewards.multiply(allocPoint).divide(totalAllocPointResult)

        const calculatedxIzaRewards = JSBI.BigInt(pendingReward?.result?.[0] ?? 0)
        const calculatedxTokenRewards = JSBI.BigInt(pendingReward?.result?.[1] ?? 0)

        const liquidityToken = new Token(chainId, lp.address, 18, lp.name, lp.name)
        const stakedAmount = new TokenAmount(liquidityToken, JSBI.BigInt(userInfo?.result?.[0] ?? 0))
        const vaultStakedAmount = new TokenAmount(liquidityToken, JSBI.BigInt(vaultBalance.result?.[0] ?? 0))
        const farmStakedAmount = new TokenAmount(liquidityToken, JSBI.BigInt(lpTokenBalance.result?.[0] ?? 0))

        const totalLpTokenSupply = new TokenAmount(liquidityToken, JSBI.BigInt(lpTokenTotalSupply.result?.[0] ?? 0))
        const totalPendingxIza = new TokenAmount(xToken, calculatedxIzaRewards)
        const totalPendingxToken = new TokenAmount(lp.protocol.xToken ?? xToken, calculatedxTokenRewards)

        const rewardTokenPrice = getRewardTokenPrice(lp.protocol.nativeToken, tokensWithPrices)

        const totalFarmStakedAmountWETH = calculateWethAdjustedTotalStakedAmount(
          chainId,
          lp.baseToken,
          tokensWithPrices,
          tokens,
          totalLpTokenSupply,
          farmStakedAmount,
          lpTokenReserve?.result
        )
        const pricePerLpToken =
          totalFarmStakedAmountWETH &&
          wethBusdPrice &&
          totalFarmStakedAmountWETH.multiply(wethBusdPrice.adjusted).divide(farmStakedAmount)

        const userAmountStakedUsd = pricePerLpToken && pricePerLpToken.multiply(stakedAmount)

        const apr =
          rewardTokenPrice && totalFarmStakedAmountWETH && wethBusdPrice
            ? calculateApr(
                rewardTokenPrice,
                baseBlockRewards,
                blocksPerYear,
                poolShare,
                totalFarmStakedAmountWETH.multiply(wethBusdPrice.adjusted)
              )
            : undefined

        const totalStakedAmountBUSD = pricePerLpToken && pricePerLpToken.multiply(vaultStakedAmount)

        // TODO - add these to object and show on front-end
        const apy = apr && calculateApy(apr)
        // const apyLp = apr && calculateApy(apr?.multiply(JSBI.BigInt(compoundRate)).divide('100'))
        // const apyIza = apr && xIzaApr && getIzaApy20Perc(apr, xIzaApr)
        // const apyCombined = apyLp && apyIza && apyLp + apyIza
        // console.log('apyLp', apyLp)
        // console.log('apyIza', apyIza)
        // console.log('combined new APY', apyCombined)

        const stakingInfo = {
          pid: pid,
          farmPid: farmPid,
          lp: lp,
          masterchef: masterchefAddress,
          buybackRate: buybackRate,
          xIzaRate: xIzaRate,
          xTokenRate: xTokenRate,
          withdrawFee: withdrawFee,
          compoundRate: compoundRate,
          allocPoint: allocPoint,
          tokens: tokens,
          baseToken: lp.baseToken,
          baseRewardsPerBlock: baseBlockRewards,
          poolRewardsPerBlock: poolBlockRewards,
          blocksPerYear: blocksPerYear,
          poolShare: poolShare,
          totalLpTokenSupply: totalLpTokenSupply,
          totalStakedAmount: vaultStakedAmount,
          stakedAmount: stakedAmount,
          stakedAmountUsd: userAmountStakedUsd,
          earnedAmountxIza: totalPendingxIza,
          earnedAmountxToken: totalPendingxToken,
          valueOfTotalStakedAmountInUsd: totalStakedAmountBUSD,
          pricePerLpToken: pricePerLpToken,
          apr: apr,
          apy: apy,
          active: active
        }

        memo.push(stakingInfo)
      }
      return memo
    }, [])
  }, [
    chainId,
    vaultInfo,
    tokensWithPrices,
    weth,
    govToken,
    xToken,
    xIzaApr,
    govTokenWETHPrice,
    wethBusdPrice,
    blocksPerYear,
    pids,
    chefData,
    poolInfos,
    userInfos,
    pendingRewards,
    lpTokenTotalSupplies,
    lpTokenReserves,
    vaultBalances,
    lpTokenBalances
  ])
}

export function useTotalGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useVaultsInfo(true)

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmountxIza),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = stakingAmount
    ? tryParseAmount(typedValue, stakingAmount.token)
    : undefined

  const parsedAmount =
    parsedInput && stakingAmount && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}
