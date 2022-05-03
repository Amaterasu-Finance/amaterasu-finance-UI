import { CurrencyAmount, JSBI, Token, TokenAmount, Fraction, Price } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useMultipleContractMultipleData, useSingleContractMultipleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import {
  IZA_CHEF_V1_INTERFACE,
  TRI_CHEF_V1_INTERFACE,
  TRI_CHEF_V2_INTERFACE,
  useVaultChefContract
} from '../../hooks/useContract'
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
import { Protocol, ProtocolName, PROTOCOLS_MAINNET } from '../../constants/protocol'
import calculateApy, { calculateDailyApy } from '../../utils/calculateApy'
import { useXFoxApr } from '../../hooks/usexFoxApy'
import { CurvePool } from '../../constants/curvePools'

const TOTAL_ALLOC_POINT_SIG = '0x17caf6f1'
const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)
const STRAT_INTERFACE = new Interface(stratABI)

// const BLOCKS_PER_YEAR_11 = 28669090 // blocks per year @ 1.1s
// const BLOCKS_PER_YEAR_10 = 31449600 // blocks per year @ 1.0s

const MIN_STAKED_AMOUNT = JSBI.BigInt(44)
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
  tokens: Token[]
  lp: LiqPool | CurvePool
  protocol: Protocol
  masterchef?: string // masterchef address for rewards info
  buybackRate?: number // buy+burn IZA %, default = 3%
  xIzaRate?: number // xIZA % of rewards, default = 20%
  xTokenRate?: number // xToken %, default = 0%
  compoundRate?: number // xToken %, default = 0%
  withdrawFee?: number // withdraw fee, default = 0.1%
  // lp Token
  lpToken: Token
  // baseToken used for TVL & APR calculations
  baseToken: Token | undefined
  // the allocation point for the given pool
  allocPoint: JSBI | undefined
  // base rewards per block
  baseRewardsPerBlock: TokenAmount | undefined
  // pool specific rewards per block
  poolRewardsPerBlock: Fraction | undefined
  // blocks generated per year
  blocksPerYear: JSBI | undefined
  // pool share vs all pools
  poolShare: Fraction | undefined
  // the total supply of lp tokens in existence
  totalLpTokenSupply: TokenAmount | undefined
  // the amount of currently total staked tokens in the pool
  totalStakedAmount: TokenAmount | undefined
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount | undefined
  // the amount of token currently staked, or undefined if no account
  userStakedAtLastAction: TokenAmount | undefined
  // the amount of token currently staked, or undefined if no account
  stakedAmountUsd: Fraction | undefined
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountxIza: TokenAmount | undefined
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountxToken: TokenAmount | undefined
  // value of total staked amount, measured in a USD stable coin (busd, usdt, usdc or a mix thereof)
  valueOfTotalStakedAmountInUsd: Fraction | undefined
  // price per LP token
  pricePerLpToken: Fraction | undefined
  // pool APR
  apr: Fraction | undefined
  // pool APY
  apy: number | undefined
  // pool daily APY
  apyDaily: number | undefined
  // pool apy base token
  apyBase: number | undefined
  // pool apy xIZA
  apyxIza: number | undefined
  // pool apy xToken
  apyxToken: number | undefined
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

export function getIzaApy50Perc(baseApr: Fraction, basexIzaApr: Fraction): number | undefined {
  const ratio =
    0.343 +
    0.00459 * Number(baseApr.toSignificant(10)) * 100 +
    0.0000477 * Math.pow(Number(baseApr.toSignificant(10)) * 100, 2)
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
  const lpTokenAddressesWoCurve = useMemo(() => vaultInfo.map(({ lp }) => (lp.isCurve ? undefined : lp.address)), [
    vaultInfo
  ])
  // TODO - eventually get from chain. but MUCH simpler to assume each curve pool lp token is worth $1
  // const curveMinterAddresses = useMemo(
  //   () => Object.keys(CURVE_POOLS_MAINNET).map((keyName, i) => CURVE_POOLS_MAINNET[keyName].minterAddress),
  //   [CURVE_POOLS_MAINNET]
  // )
  // const curvePrices = useMultipleContractSingleData(stratAddresses, CURVE_MINTER_INTERFACE, 'get_virtual_price')

  const PAIR_INTERFACES = useMemo(() => lpTokenAddresses.map(() => PAIR_INTERFACE), [lpTokenAddresses])
  const stratAddresses = useMemo(() => vaultInfo.map(({ stratAddress }) => stratAddress), [vaultInfo])
  const masterchefAddresses = useMemo(
    () => vaultInfo.map(({ lp, masterchef }) => (lp.isCurve ? undefined : masterchef)),
    [vaultInfo]
  )
  const masterchefInterfaces: Interface[] = useMemo(
    () =>
      vaultInfo.map(({ masterchef }) => {
        switch (masterchef) {
          case PROTOCOLS_MAINNET.Trisolaris.masterchefV1:
            return TRI_CHEF_V1_INTERFACE
          case PROTOCOLS_MAINNET.Trisolaris.masterchefV2:
            return TRI_CHEF_V2_INTERFACE
          case PROTOCOLS_MAINNET.Amaterasu.masterchefV1:
            return IZA_CHEF_V1_INTERFACE
          default:
            return TRI_CHEF_V1_INTERFACE
        }
      }),
    [vaultInfo]
  )

  const pidAccountMapping = useMemo(
    () => vaultInfo.map(({ pid }) => (account ? [pid, account] : [undefined, undefined])),
    [vaultInfo, account]
  )
  const masterchefArgs = useMemo(() => vaultInfo.map(({ masterchef }) => [masterchef]), [vaultInfo])

  const pendingRewards = useSingleContractMultipleData(vaultChefContract, 'pendingRewards', pidAccountMapping)
  const userInfos = useSingleContractMultipleData(vaultChefContract, 'stakedWantTokens', pidAccountMapping)
  const userInfosList = useSingleContractMultipleData(vaultChefContract, 'userInfo', pidAccountMapping)
  const vaultBalances = useMultipleContractSingleData(stratAddresses, STRAT_INTERFACE, 'wantLockedTotal')
  const pausedList = useMultipleContractSingleData(stratAddresses, STRAT_INTERFACE, 'paused')

  // TODO - need to add each masterchef here and call 2 functions: rewardPerBlock and totalAllocPoint
  const chefData = useMultipleCallsNoInputsReturnInt(
    [
      PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].masterchefV1,
      PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].masterchefV1,
      PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].masterchefV2,
      PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].masterchefV2,
      PROTOCOLS_MAINNET[ProtocolName.AMATERASU].masterchefV1,
      PROTOCOLS_MAINNET[ProtocolName.AMATERASU].masterchefV1
    ],
    [
      PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].perBlockFunctionSig,
      TOTAL_ALLOC_POINT_SIG,
      PROTOCOLS_MAINNET[ProtocolName.TRISOLARIS].perBlockFunctionSig,
      TOTAL_ALLOC_POINT_SIG,
      PROTOCOLS_MAINNET[ProtocolName.AMATERASU].perBlockFunctionSig,
      TOTAL_ALLOC_POINT_SIG
    ]
  )

  const poolInfos = useMultipleContractMultipleData(
    masterchefAddresses,
    masterchefInterfaces,
    'poolInfo',
    farmPids.map(pid => [pid])
  )

  const lpTokenTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'totalSupply')
  const lpTokenReserves = useMultipleContractSingleData(lpTokenAddressesWoCurve, PAIR_INTERFACE, 'getReserves')
  const lpTokenBalances = useMultipleContractMultipleData(
    lpTokenAddresses,
    PAIR_INTERFACES,
    'balanceOf',
    masterchefArgs
  )

  return useMemo(() => {
    // console.log(new Date().toLocaleString(), 'fetchVaults memo')
    if (!chainId || !weth || !govToken || !xToken) return []

    return pids.reduce<VaultsInfo[]>((memo, pid, index) => {
      let active = vaultInfo[index].active
      const tokens = vaultInfo[index].tokens
      const farmPid = vaultInfo[index].farmPid
      const lp = vaultInfo[index].lp
      const masterchefAddress = vaultInfo[index].masterchef
      const buybackRate = vaultInfo[index].buybackRate ?? DEFAULT_BUYBACK_RATE
      const xIzaRate = vaultInfo[index].xIzaRate ?? DEFAULT_XIZA_RATE
      const xTokenRate = vaultInfo[index].xTokenRate ?? DEFAULT_XTOKEN_RATE
      const withdrawFee = vaultInfo[index].withdrawFee ?? DEFAULT_WITHDRAW_FEE
      const poolInfo = poolInfos[index]
      const paused = pausedList[index]
      const compoundRate = 100 - DEFAULT_CONTROLLER_FEE - buybackRate - xIzaRate - xTokenRate

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const userInfoList = userInfosList[index]
      const pendingReward = pendingRewards[index]
      const lpTokenTotalSupply = lpTokenTotalSupplies[index]
      const lpTokenReserve = lpTokenReserves[index]
      const lpTokenBalance = lpTokenBalances[index]
      const vaultBalance = vaultBalances[index]
      const liquidityToken = new Token(chainId, lp.address, 18, lp.name, lp.name)

      let rewardPerBlock
      let totalAllocPoint
      let allocIndex
      switch (vaultInfo[index].masterchef) {
        case PROTOCOLS_MAINNET.Trisolaris.masterchefV1:
          rewardPerBlock = chefData[0]
          totalAllocPoint = chefData[1]
          allocIndex = 1
          break
        case PROTOCOLS_MAINNET.Trisolaris.masterchefV2:
          rewardPerBlock = chefData[2]
          totalAllocPoint = chefData[3]
          allocIndex = 2
          break
        case PROTOCOLS_MAINNET.Amaterasu.masterchefV1:
          rewardPerBlock = chefData[4]
          totalAllocPoint = chefData[5]
          allocIndex = 1
          break
        default:
          rewardPerBlock = chefData[0]
          totalAllocPoint = chefData[1]
          allocIndex = 1
      }

      if (validStakingInfo(tokens, poolInfo, lpTokenTotalSupply, lpTokenReserve, lpTokenBalance)) {
        let allocPoint = JSBI.BigInt('1')
        let totalAllocPointResult = JSBI.BigInt('1')
        let poolShare = new Fraction('1')
        let baseBlockRewards
        if (lp.isCurve) {
          // TODO - read from chain eventually
          baseBlockRewards = new TokenAmount(
            lp.protocol.nativeToken ?? govToken,
            vaultInfo[index].bonusRewarderTokenPerBlock ?? '0'
          )
        } else {
          const poolInfoResult = poolInfo.result
          allocPoint = JSBI.BigInt((poolInfoResult && poolInfoResult[allocIndex]) ?? '0')
          totalAllocPointResult = JSBI.BigInt(totalAllocPoint.result?.[0] ?? 1)
          const baseRewardsPerBlock = JSBI.BigInt(rewardPerBlock.result?.[0] ?? 0)

          poolShare = new Fraction(allocPoint, totalAllocPointResult)
          // Fallback to gov token even though it's dumb
          baseBlockRewards = new TokenAmount(lp.protocol.nativeToken ?? govToken, baseRewardsPerBlock)
        }
        const poolBlockRewards = baseBlockRewards && baseBlockRewards.multiply(allocPoint).divide(totalAllocPointResult)

        const calculatedxIzaRewards = JSBI.BigInt(pendingReward?.result?.[0] ?? 0)
        const calculatedxTokenRewards = JSBI.BigInt(pendingReward?.result?.[1] ?? 0)

        const amountParsed = JSBI.BigInt(userInfo?.result?.[0] ?? 0)
        const amountStaked = JSBI.greaterThan(amountParsed, MIN_STAKED_AMOUNT) ? amountParsed : JSBI.BigInt(0)
        const stakedAmount = new TokenAmount(liquidityToken, amountStaked)
        const amountVault = JSBI.BigInt(vaultBalance?.result?.[0] ?? 0)
        const vaultAmount = JSBI.greaterThan(amountVault, MIN_STAKED_AMOUNT) ? amountVault : JSBI.BigInt(0)
        const vaultStakedAmount = new TokenAmount(liquidityToken, vaultAmount)
        const userStakedAtLastAction = new TokenAmount(liquidityToken, JSBI.BigInt(userInfoList?.result?.[3] ?? 0))
        const farmStakedAmount = new TokenAmount(liquidityToken, JSBI.BigInt(lpTokenBalance.result?.[0] ?? 0))

        const totalLpTokenSupply = new TokenAmount(liquidityToken, JSBI.BigInt(lpTokenTotalSupply.result?.[0] ?? 0))
        const totalPendingxIza = new TokenAmount(xToken, calculatedxIzaRewards)
        const totalPendingxToken = new TokenAmount(lp.protocol.xToken ?? xToken, calculatedxTokenRewards)

        const rewardTokenPrice = getRewardTokenPrice(lp.protocol.nativeToken, tokensWithPrices)

        let totalFarmStakedAmountUSD
        let pricePerLpToken
        if (lp.isCurve) {
          totalFarmStakedAmountUSD = farmStakedAmount
          pricePerLpToken = new Fraction('1')
        } else {
          const totalFarmStakedAmountWETH = calculateWethAdjustedTotalStakedAmount(
            chainId,
            lp.baseToken,
            tokensWithPrices,
            tokens,
            totalLpTokenSupply,
            farmStakedAmount,
            lpTokenReserve?.result
          )
          totalFarmStakedAmountUSD =
            totalFarmStakedAmountWETH && wethBusdPrice && totalFarmStakedAmountWETH.multiply(wethBusdPrice.adjusted)
          pricePerLpToken = totalFarmStakedAmountUSD && totalFarmStakedAmountUSD.divide(farmStakedAmount)
        }

        const userAmountStakedUsd = pricePerLpToken && pricePerLpToken.multiply(stakedAmount)
        const totalStakedAmountBUSD = pricePerLpToken && pricePerLpToken.multiply(vaultStakedAmount)

        const aprInital =
          rewardTokenPrice && totalFarmStakedAmountUSD
            ? calculateApr(rewardTokenPrice, baseBlockRewards, blocksPerYear, poolShare, totalFarmStakedAmountUSD)
            : new Fraction('0')

        const bonusRewardTokenPrice =
          vaultInfo[index].bonusRewarderToken &&
          getRewardTokenPrice(vaultInfo[index].bonusRewarderToken, tokensWithPrices)
        const aprBonus =
          bonusRewardTokenPrice &&
          vaultInfo[index].bonusRewarderToken &&
          vaultInfo[index].bonusRewarderTokenPerBlock &&
          totalFarmStakedAmountUSD
            ? calculateApr(
                bonusRewardTokenPrice,
                new TokenAmount(
                  vaultInfo[index].bonusRewarderToken ?? govToken,
                  vaultInfo[index].bonusRewarderTokenPerBlock ?? '0'
                ),
                blocksPerYear,
                new Fraction('1'),
                totalFarmStakedAmountUSD
              )
            : new Fraction('0')
        const apr = aprInital?.add(aprBonus ?? '0')

        const apyDaily = apr && calculateDailyApy(apr)
        const apyBase = apr && calculateApy(apr?.multiply(JSBI.BigInt(compoundRate)).divide('100'))
        const apyIza =
          apr && xIzaApr && (xIzaRate === 50 ? getIzaApy50Perc(apr, xIzaApr) : getIzaApy20Perc(apr, xIzaApr))
        const apyxToken = 0
        const apyCombined = apyBase && apyIza && apyBase + apyIza + apyxToken
        // if (pid === 28) {
        //   console.log('pid - ', pid)
        //   console.log('aprInital', aprInital?.toSignificant(10))
        //   // console.log('totalFarmStakedAmountUSD', totalFarmStakedAmountUSD?.toSignificant(10), totalFarmStakedAmountUSD)
        //   console.log('rosePrice', rewardTokenPrice && rewardTokenPrice.toSignificant(10))
        // }
        // update active based on paused status
        active = paused && paused.result ? !paused.result[0] && active : active

        const stakingInfo = {
          pid: pid,
          farmPid: farmPid,
          lp: lp,
          lpToken: liquidityToken,
          protocol: vaultInfo[index].protocol,
          active: active,
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
          userStakedAtLastAction: userStakedAtLastAction,
          earnedAmountxIza: totalPendingxIza,
          earnedAmountxToken: totalPendingxToken,
          valueOfTotalStakedAmountInUsd: totalStakedAmountBUSD,
          pricePerLpToken: pricePerLpToken,
          apr: apr,
          apy: apyCombined,
          apyDaily: apyDaily,
          apyBase: apyBase,
          apyxIza: apyIza,
          apyxToken: apyxToken
        }

        memo.push(stakingInfo)
      } else {
        const stakingInfo = {
          ...vaultInfo[index],
          buybackRate: buybackRate,
          xIzaRate: xIzaRate,
          xTokenRate: xTokenRate,
          withdrawFee: withdrawFee,
          compoundRate: compoundRate,
          lpToken: liquidityToken,
          baseToken: lp.baseToken,
          allocPoint: undefined,
          baseRewardsPerBlock: undefined,
          poolRewardsPerBlock: undefined,
          blocksPerYear: undefined,
          poolShare: undefined,
          totalLpTokenSupply: undefined,
          totalStakedAmount: undefined,
          stakedAmount: undefined,
          stakedAmountUsd: undefined,
          userStakedAtLastAction: undefined,
          earnedAmountxIza: undefined,
          earnedAmountxToken: undefined,
          valueOfTotalStakedAmountInUsd: undefined,
          pricePerLpToken: undefined,
          apr: undefined,
          apy: undefined,
          apyDaily: undefined,
          apyBase: undefined,
          apyxIza: undefined,
          apyxToken: undefined
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
    userInfosList,
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
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmountxIza ?? new TokenAmount(govToken, '0')),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | CurrencyAmount | undefined
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
