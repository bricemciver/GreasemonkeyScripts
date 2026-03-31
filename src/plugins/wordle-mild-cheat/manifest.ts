import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Wordle Mild Cheat',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Will show you all of the valid words that still exist based on your guesses',
    license: 'MIT',
    version: '0.1',
    match: 'https://www.nytimes.com/games/wordle/index.html',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=nytimes.com',
    grant: ['GM.xmlHttpRequest', 'GM_xmlhttpRequest'],
    'run-at': 'document-start',
  }
}
