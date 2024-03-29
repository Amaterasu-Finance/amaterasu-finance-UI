import { TokenAmount } from '@amaterasu-fi/sdk'
import React, { useState } from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { MouseoverTooltip } from '../Tooltip'
import styled from 'styled-components'
import HeaderLogo from 'assets/images/Amaterasu_Sun_Logo-Header_02_Mirrored.png'
import MobileLogo from 'assets/svg/amaterasu.svg'
import DarkIcon from 'assets/images/token-list/iza-blue.png'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance, useETHBalances } from '../../state/wallet/hooks'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import { TYPE } from '../../theme'
import MiscMenu from '../Menu'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
import { useToggleSelfClaimModal, useShowClaimPopup } from '../../state/application/hooks'
import { useUserHasAvailableClaim } from '../../state/claim/hooks'
import { useUserHasSubmittedClaim } from '../../state/transactions/hooks'
import { Dots } from '../swap/styleds'
import Modal from '../Modal'
import GovTokenBalanceContent from './GovTokenBalanceContent'
import { GOVERNANCE_TOKEN_INTERFACE } from '../../constants/abis/governanceToken'
import { PIT_SETTINGS } from '../../constants'
import useAddTokenToMetamask from '../../hooks/useAddTokenToMetamask'
import { Menu, Dropdown } from 'antd'
import {
  MenuOutlined,
  ExperimentOutlined,
  SwapOutlined,
  WalletOutlined,
  FireOutlined,
  BankOutlined,
  LoginOutlined
} from '@ant-design/icons'
import { isMobile } from 'react-device-detect'
import useUSDCPrice from '../../utils/useUSDCPrice'

const HeaderFrame = styled.div`
  display: grid;
  background-color: ${({ theme }) => theme.bg1};
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  padding: 0 0.5rem;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 4px;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderSubMenu = styled(Row)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    padding: 1rem 0 1rem 1rem;
  `};
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToLarge`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 1rem 0 0.2rem 0.5rem;
    justify-content: flex-end;
    display: none;
`};
  padding: 0.4rem;
`

const LogoImage = styled('img')`
  width: 306px;
  height: 72px;
  padding: 0.2rem;
  cursor: pointer;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 306px;
    height: 72px;
`};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

const MobileImage = styled('img')`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
    width: 72px;
    height: 72px;
    padding: 0.25rem;
    cursor: pointer;
  `}
`

const LogoIcon = styled('img')`
  width: 45px;
  height: 45px;
  cursor: pointer;
  margin: 3px 3px 0 3px;
  padding: 1px;
  transition: box-shadow 0.3s ease-in-out;
  border-radius: 50%;
  &:hover {
    box-shadow: 0 0 10px ${({ theme }) => darken(0.05, theme.secondary1)};
  }
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 8px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(
    76.02% 75.41% at 1.84% 0%,
    ${({ theme }) => theme.tokenButtonGradientStart} 0%,
    ${({ theme }) => theme.tokenButtonGradientEnd} 100%
  );
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  padding: .65rem;
  margin-left: 4px;
  border-radius: 15px;
  &:hover {
    color: ${({ theme }) => theme.secondary1}
  }

  &:focus {
    color: ${({ theme }) => darken(0.1, theme.secondary1)}
  }
  
  &:active {
    color: ${({ theme }) => darken(0.1, theme.secondary1)}
    transform: translateY(0.1rem)
  }
`

const TokenSelectionWrapper = styled.div`
  padding: 0.75rem;
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.secondary1};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const IzaPricePill = styled(Row)`
  align-content: center;
  color: ${({ theme }) => theme.primary1};
  border-radius: 2rem;
  font-weight: 500;
  display: flex;
  background: ${({ theme }) => theme.bg2};
`

const CondensedMenu = (
  <Menu style={{ background: '#212429' }}>
    <Menu.Item icon={<SwapOutlined style={{ fontSize: '1.25em' }} />}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} style={{ marginLeft: '0px' }}>
        Swap
      </StyledNavLink>
    </Menu.Item>
    <Menu.Item icon={<ExperimentOutlined style={{ fontSize: '1.25em' }} />}>
      <StyledNavLink
        id={`pool-nav-link`}
        to={'/pool'}
        style={{ marginLeft: '0px' }}
        isActive={(match, { pathname }) =>
          Boolean(match) ||
          pathname.startsWith('/add') ||
          pathname.startsWith('/remove') ||
          pathname.startsWith('/create') ||
          pathname.startsWith('/find')
        }
      >
        Pool
      </StyledNavLink>
    </Menu.Item>
    <Menu.Item icon={<WalletOutlined style={{ fontSize: '1.25em' }} />}>
      <StyledNavLink id={`pit-nav-link`} to={'/stake'} style={{ marginLeft: '0px' }}>
        Stake
      </StyledNavLink>
    </Menu.Item>
    <Menu.Item icon={<FireOutlined style={{ fontSize: '1.25em' }} />}>
      <StyledNavLink id={`farm-nav-link`} to={'/farm'} style={{ marginLeft: '0px' }}>
        Farm
      </StyledNavLink>
    </Menu.Item>
    <Menu.Item icon={<BankOutlined style={{ fontSize: '1.25em' }} />}>
      <StyledNavLink id={`vault-nav-link`} to={'/vault'} style={{ marginLeft: '0px' }}>
        Vaults
      </StyledNavLink>
    </Menu.Item>
    <Menu.Item icon={<LoginOutlined style={{ fontSize: '1.25em' }} />}>
      <StyledNavLink id={`bridge-nav-link`} to={'/bridge'} style={{ marginLeft: '0px' }}>
        Bridge
      </StyledNavLink>
    </Menu.Item>
  </Menu>
)

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)

  const govToken = useGovernanceToken()
  const govTokenPrice = useUSDCPrice(govToken)
  const addGov = useAddTokenToMetamask(govToken)
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const userFoxBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const pitSettings = chainId ? PIT_SETTINGS[chainId] : undefined
  const toggleClaimModal = useToggleSelfClaimModal()
  const availableClaim: boolean = useUserHasAvailableClaim(account)
  const showClaimPopup = useShowClaimPopup()

  return (
    <HeaderFrame>
      <ClaimModal />
      <HeaderRow gap={'lg'}>
        <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
          <GovTokenBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
        </Modal>
        <MobileImage src={MobileLogo} onClick={() => setShowUniBalanceModal(true)} alt="logo" />
        {!isMobile && <LogoImage src={HeaderLogo} onClick={() => setShowUniBalanceModal(true)} alt="logo" />}
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            <SwapOutlined style={{ fontSize: '1.25em', marginRight: '8px', alignSelf: 'center', color: '#f3841e' }} />
            {t('swap')}
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            <ExperimentOutlined
              style={{ fontSize: '1.25em', marginRight: '8px', alignSelf: 'center', color: '#f3841e' }}
            />
            {t('pool')}
          </StyledNavLink>
          <StyledNavLink id={`pit-nav-link`} to={`${pitSettings?.path}`}>
            <WalletOutlined style={{ fontSize: '1.25em', marginRight: '8px', alignSelf: 'center', color: '#f3841e' }} />
            {pitSettings?.name}
          </StyledNavLink>
          <StyledNavLink id={`farm-nav-link`} to={'/farm'}>
            <FireOutlined style={{ fontSize: '1.25em', marginRight: '8px', alignSelf: 'center', color: '#f3841e' }} />
            {t('Farm')}
          </StyledNavLink>
          <StyledNavLink id={`vault-nav-link`} to={'/vault'}>
            <BankOutlined style={{ fontSize: '1.25em', marginRight: '8px', alignSelf: 'center', color: '#f3841e' }} />
            {t('Vaults')}
          </StyledNavLink>
          <StyledNavLink id={`bridge-nav-link`} to={'/bridge'}>
            <LoginOutlined style={{ fontSize: '1.25em', marginRight: '8px', alignSelf: 'center', color: '#f3841e' }} />
            {t('Bridge')}
          </StyledNavLink>
        </HeaderLinks>
        <HeaderSubMenu>
          <Dropdown overlay={CondensedMenu}>
            <MenuOutlined style={{ fontSize: '3em' }} />
          </Dropdown>
        </HeaderSubMenu>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <TokenSelectionWrapper>
            <HeaderElementWrap>
              <IzaPricePill>
                <MouseoverTooltip text={'Add IZA to MetaMask'}>
                  <LogoIcon src={DarkIcon} onClick={addGov.addToken} alt="logo" />
                </MouseoverTooltip>
                <div>
                  <Text margin={'0 10px 0 0'} fontSize={'16px'}>
                    ${govTokenPrice ? govTokenPrice?.toFixed(3) : '0.00'}
                  </Text>
                </div>
              </IzaPricePill>
            </HeaderElementWrap>
          </TokenSelectionWrapper>
          {availableClaim && !showClaimPopup && (
            <UNIWrapper onClick={toggleClaimModal}>
              <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                <TYPE.white padding="0 2px">
                  {claimTxn && !claimTxn?.receipt ? (
                    <Dots>Claiming {govToken?.symbol}</Dots>
                  ) : (
                    `Claim ${govToken?.symbol}`
                  )}
                </TYPE.white>
              </UNIAmount>
            </UNIWrapper>
          )}
          <AccountElement
            onClick={() => setShowUniBalanceModal(true)}
            active={!!account}
            style={{ pointerEvents: 'auto' }}
          >
            {account && userFoxBalance && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4, { groupSeparator: ',' })} ETH
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <MiscMenu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
