import { getTokenFallbackLogoURL } from './../components/CurrencyLogo/index'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { Currency, Token } from '@amaterasu-fi/sdk'
import { useCallback, useState } from 'react'
import { useActiveWeb3React } from 'hooks'

export default function useAddTokenToMetamask(
  currencyToAdd: Currency | undefined
): { addToken: () => void; success: boolean | undefined } {
  const { library, chainId } = useActiveWeb3React()

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId)

  const [success, setSuccess] = useState<boolean | undefined>()

  const addToken = useCallback(() => {
    if (library && library.provider.isMetaMask && library.provider.request && token) {
      const imageUrl =
        token?.symbol == 'IZA'
          ? 'https://raw.githubusercontent.com/Amaterasu-Finance/amaterasu-finance-mediakit/main/Amaterasu%20Finance%20logos/IZANAGI%20Logos/Izanagi%20light%20blue%20-%20transparent.png'
          : getTokenFallbackLogoURL(token)
      library.provider
        .request({
          method: 'wallet_watchAsset',
          params: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore // need this for incorrect ethers provider type
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: imageUrl
            }
          }
        })
        .then(success => {
          setSuccess(success)
        })
        .catch(() => setSuccess(false))
    } else {
      setSuccess(false)
    }
  }, [library, token])

  return { addToken, success }
}
