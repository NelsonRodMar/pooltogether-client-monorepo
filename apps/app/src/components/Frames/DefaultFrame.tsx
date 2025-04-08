import { DOMAINS } from '@shared/utilities'
import Head from 'next/head'

export const DefaultFrame = () => {
  
  return (
      <meta name="fc:frame" content={JSON.stringify({
          version: "next",
          imageUrl: `${DOMAINS.app}/twitter-share-image-1200-675.png`,
          button: {
            title: "Launch Pooltogether 🏆",
            action: {
              type: "launch_frame",
              name: "Pooltogether (unofficial)",
              url: `${DOMAINS.app}`,
              splashImageUrl: `${DOMAINS.app}/favicon.png`,
              splashBackgroundColor: "#21064e"
            }
          }
        })} data-rh="true"/>
  );
};