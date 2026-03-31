import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Equip-Bid Keyboard Nav',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Use Feedly-style navigation on Equip Bid auctions',
    license: 'MIT',
    version: '0.2',
    match: 'https://www.equip-bid.com/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com',
    grant: ['GM_xmlhttpRequest', 'GM.xmlHttpRequest'],
    connect: 'equip-bid.com',
  }
}
