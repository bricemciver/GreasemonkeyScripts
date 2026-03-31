import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Wirecutter Anti-modal',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Stop modals asking you to register before viewing articles',
    license: 'MIT',
    version: '0.0.2',
    match: 'https://www.nytimes.com/wirecutter/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=nytimes.com',
    grant: 'none',
  }
}
