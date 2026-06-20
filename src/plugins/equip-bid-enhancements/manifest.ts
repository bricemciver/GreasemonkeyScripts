import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Equip-Bid Enhancements',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description:
      'Quality-of-life improvements for equip-bid.com auctions: stay logged in, recover dropped connections, show the true all-in cost per lot, surface bid counts on the auction grid, and preview every lot photo in a carousel — all without opening each item.',
    license: 'MIT',
    version: '0.1',
    match: 'https://www.equip-bid.com/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com',
    grant: [
      'GM_xmlhttpRequest',
      'GM.xmlHttpRequest',
      'GM_cookie',
      'GM.cookie',
      'GM_getValue',
      'GM.getValue',
      'GM_setValue',
      'GM.setValue',
      'GM_deleteValue',
      'GM.deleteValue',
      'GM_registerMenuCommand',
      'GM.registerMenuCommand',
    ],
    connect: 'equip-bid.com',
    'run-at': 'document-start',
    supportURL: 'https://github.com/bricemciver/GreasemonkeyScripts/issues',
  }
}
