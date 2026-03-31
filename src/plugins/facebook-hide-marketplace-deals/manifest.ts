import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Facebook Hide Marketplace Deals',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Hide the sponsored deals that show up in marketplace searches',
    license: 'MIT',
    version: '0.0.2',
    match: '*://*.facebook.com/marketplace/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=facebook.com',
    grant: 'none',
  }
}
