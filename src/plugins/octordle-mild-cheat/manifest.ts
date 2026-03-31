import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Octordle Mild Cheat',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Give you hints for each game board based on valid remaining words',
    license: 'MIT',
    version: '0.1',
    match: 'https://www.britannica.com/games/octordle*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=britannica.com',
    grant: ['GM.xmlHttpRequest', 'GM_xmlhttpRequest'],
    'run-at': 'document-start',
  }
}
