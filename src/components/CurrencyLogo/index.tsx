import { Currency, Token, ETHER, BINANCE_COIN, DEFAULT_CURRENCIES, Blockchain } from '@amaterasu-fi/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import BinanceLogo from '../../assets/images/binance-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import baseCurrencies from '../../utils/baseCurrencies'
import useBlockchain from '../../hooks/useBlockchain'

// Look for the images locally in public/images/token-list
const LOCAL_ADDRESSES = [
  '0x0017Be3E7e36ABF49FE67a78D08bf465bB755120',
  '0x00a761b10B4Ff8Fc205E685484a1da60451857e1',
  '0xDAe6c2A48BFAA66b43815c5548b10800919c993E',
  '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
  '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
  '0xdFA46478F9e5EA86d57387849598dbFB2e964b02'
]

const SVG_ADDRESSES = [
  '0x9f1F933C660a1DC856F0E0Fe058435879c5CCEf0',
  '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
  '0x5183e1B1091804BC2602586919E6880ac1cf2896',
  '0x07F9F7f963C5cD2BBFFd30CcfB964Be114332E30'
]

export const getTokenLogoURL = (address: string) => {
  if (LOCAL_ADDRESSES.includes(address)) {
    return ``
  }
  if (SVG_ADDRESSES.includes(address)) {
    return `https://raw.githubusercontent.com/trisolaris-labs/tokens/master/assets/${address}/logo.svg`
  }
  return `https://raw.githubusercontent.com/trisolaris-labs/tokens/master/assets/${address}/logo.png`
}
export const getTokenFallbackLogoURL = (currency: Currency) => {
  return `images/token-list/${currency.symbol?.toLocaleLowerCase()}.png`
}

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 20px;
  padding: 2px;
  background-color: ${({ theme }) => theme.white};
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '35px',
  style
}: {
  currency?: Currency | Token
  size?: string
  style?: React.CSSProperties
}) {
  const blockchain = useBlockchain()
  const uriLocations = [
    ...useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined),
    ...useHttpLocations(currency instanceof Token ? getTokenLogoURL(currency.address) : undefined)
  ]

  const srcs: string[] = useMemo(() => {
    if (currency && DEFAULT_CURRENCIES.includes(currency)) return []

    if (currency instanceof Token) {
      const logoUrlLocation = [1313161554, 1313161555, 62621].includes(currency.chainId)
        ? getTokenFallbackLogoURL(currency)
        : getTokenFallbackLogoURL(currency)

      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, logoUrlLocation]
      }
      return [...uriLocations, logoUrlLocation]
    }
    return []
  }, [currency, uriLocations])

  if (currency === ETHER) {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  } else {
    const wrappedCurrency = currency instanceof Token ? baseCurrencies(currency.chainId)[1] : undefined
    if (currency === BINANCE_COIN || (currency === wrappedCurrency && blockchain === Blockchain.BINANCE_SMART_CHAIN)) {
      return <StyledEthereumLogo src={BinanceLogo} size={size} style={style} />
    }
  }
  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
