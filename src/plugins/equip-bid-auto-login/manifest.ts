import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Equip-Bid Auto Login',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description:
      'Keep yourself logged into equip-bid.com: when the session cookie is missing or expired, silently re-submit your saved credentials and return you to the page you were headed to.',
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
