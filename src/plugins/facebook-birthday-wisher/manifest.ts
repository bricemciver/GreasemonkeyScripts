import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Facebook Birthday Wisher',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description:
      'Writes a varied, relationship-appropriate birthday wish on the timeline of each friend whose birthday is today',
    license: 'MIT',
    version: '0.1',
    match: '*://*.facebook.com/friends*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=facebook.com',
    supportURL: 'https://github.com/bricemciver/GreasemonkeyScripts/issues',
    grant: [
      'GM_getValue',
      'GM.getValue',
      'GM_setValue',
      'GM.setValue',
      'GM_deleteValue',
      'GM.deleteValue',
      'GM_registerMenuCommand',
      'GM.registerMenuCommand',
      'GM_addStyle',
    ],
    'run-at': 'document-idle',
  }
}
