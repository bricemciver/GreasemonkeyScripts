import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Ancestry.com - Remove paid hints',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Removes paid hints on the "All Hints" page and on individual person pages',
    license: 'MIT',
    version: '0.0.3',
    match: [
      'https://*.ancestry.com/hints/tree/*',
      'https://*.ancestry.de/hints/tree/*',
      'https://*.ancestry.com/cs/offers/join*',
    ],
    grant: ['GM_xmlhttpRequest', 'GM.xmlHttpRequest'],
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=ancestry.com',
    'run-at': 'document-start',
  }
}
