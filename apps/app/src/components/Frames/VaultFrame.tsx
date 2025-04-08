import { DOMAINS } from '@shared/utilities'
import Head from 'next/head'
import { DefaultFrame } from './DefaultFrame'

export interface VaultFrameProps {
  chainId?: string
  vaultAddress?: string
}

// TODO: this is just a temporary vault frame to at least link to the vault page with a button
export const VaultFrame = (props: VaultFrameProps) => {
  const { chainId, vaultAddress } = props

  if (!chainId || !vaultAddress) {
    return <DefaultFrame />
  }

  return (
    <Head>
    <meta name="fc:frame" content={JSON.stringify({
        version: "next",
        imageUrl: `${DOMAINS.app}/twitter-share-image-1200-675.png`,
        button: {
          title: `Deposit in a vault 💰`, //TODO Add the name of the vault + data of other user deposited /!\ Max 32 char.
          action: {
            type: "launch_frame",
            name: "Pooltogether (unofficial)",
            url: `${DOMAINS.app}/vault/${chainId}/${vaultAddress}`,
            splashImageUrl: `${DOMAINS.app}/favicon.png`,
            splashBackgroundColor: "#21064e"
          }
        }
      })} data-rh="true"/>
    </Head>
  )
}
