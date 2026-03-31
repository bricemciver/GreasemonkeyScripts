import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Quordle Mild Cheat',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    version: '0.1',
    license: 'MIT',
    description: "Get hints based on the words you've already tried",
    match: 'https://www.merriam-webster.com/games/quordle/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=merriam-webster.com',
    grant: ['GM.xmlHttpRequest', 'GM_xmlhttpRequest'],
    supportURL: 'https://github.com/bricemciver/GreasemonkeyScripts/issues',
  }
}
