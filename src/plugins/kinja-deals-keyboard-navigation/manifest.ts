import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Kinja Deals Keyboard Navigation',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: "Use 'j' and 'k' keys for navigation of post content",
    license: 'MIT',
    version: '0.0.8',
    match: '*://*.theinventory.com/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=theinventory.com',
    grant: 'none',
  }
}
