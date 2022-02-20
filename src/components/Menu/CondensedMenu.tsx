import React, { useRef } from 'react'
import { Menu } from 'react-feather'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'

// import { ExternalLink } from '../../theme'
import { ButtonPrimary } from '../Button'

import useGovernanceToken from '../../hooks/useGovernanceToken'
import useBlockchain from '../../hooks/useBlockchain'
import { Blockchain } from '@amaterasu-fi/sdk'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'

const StyledMenuIcon = styled(Menu)`
  width: 2.5rem;
  height: 2.5rem;
  color: white;
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
  
  path {
    stroke: ${({ theme }) => theme.text1};
  }
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
  margin-left: 20px;
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

  > svg {
    margin-right: 8px;
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 4rem;
  right: 0rem;
  z-index: 100;
`

export default function CondensedMenu() {
  const { account } = useActiveWeb3React()
  const blockchain = useBlockchain()
  const govToken = useGovernanceToken()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  return (
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            Swap
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
            Pool
          </StyledNavLink>
          <StyledNavLink id={`pit-nav-link`} to={'/stake'}>
            Stake
          </StyledNavLink>
          <StyledNavLink id={`farm-nav-link`} to={'/farm'}>
            Farm
          </StyledNavLink>
          {/*<MenuItem id="link" href="https://docs.amaterasu.finance/overview/introduction">*/}
          {/*  <Book size={14} />*/}
          {/*  Docs*/}
          {/*</MenuItem>*/}
          {/*<MenuItem id="link" href="https://discord.com/invite/UvV6bER3gz">*/}
          {/*  <MessageSquare size={14} />*/}
          {/*  Discord*/}
          {/*</MenuItem>*/}
          {/*<MenuItem id="link" href="https://t.me/amaterasufinance">*/}
          {/*  <Send size={14} />*/}
          {/*  Telegram*/}
          {/*</MenuItem>*/}
          {/*<MenuItem id="link" href="https://twitter.com/amaterasufi?s=21">*/}
          {/*  <Twitter size={14} />*/}
          {/*  Twitter*/}
          {/*</MenuItem>*/}
          {/*<MenuItem id="link" href={CODE_LINK}>*/}
          {/*  <Code size={14} />*/}
          {/*  Code*/}
          {/*</MenuItem>*/}
          {account && blockchain === Blockchain.ETHEREUM && (
            <ButtonPrimary onClick={openClaimModal} padding="8px 16px" width="100%" borderRadius="12px" mt="0.5rem">
              Claim {govToken?.symbol}
            </ButtonPrimary>
          )}
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
