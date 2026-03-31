import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Ancestry Premium Content Blocker',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    version: '1.0.0',
    description: 'Preload links and disable those that redirect to signup pages',
    match: ['https://*.ancestry.com/*', 'https://ancestry.com/*'],
    grant: 'none',
    'run-at': 'document-idle',
  }
}
