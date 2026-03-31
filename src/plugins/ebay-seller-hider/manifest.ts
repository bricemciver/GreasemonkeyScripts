import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'eBay Seller Hider',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Hide items from low/poor feedback eBay sellers and sponsored items',
    license: 'MIT',
    version: '0.0.5',
    match: '*://*.ebay.com/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=ebay.com',
  }
}
