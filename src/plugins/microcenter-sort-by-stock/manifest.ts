import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Microcenter sort by stock',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    author: 'Brice McIver <github@bricemciver.com>',
    copyright: '2024 Brice McIver',
    description: 'Adds an option to sort the search results by number in stock at the selected store',
    license: 'MIT',
    version: '0.0.1',
    match: '*://www.microcenter.com/*',
    icon: 'https://icons.duckduckgo.com/ip3/microcenter.com.ico',
    grant: 'none',
    supportURL: 'https://github.com/bricemciver/GreasemonkeyScripts/issues',
  }
}
