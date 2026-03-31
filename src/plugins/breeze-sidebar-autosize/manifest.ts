import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Breeze Sidebar Auto-size',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Size the sidebar to fit the width of the content',
    license: 'MIT',
    version: '0.2',
    match: 'https://*.breezechms.com/*',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=breezechms.com',
    supportURL: 'https://github.com/bricemciver/GreasemonkeyScripts/issues',
  }
}
