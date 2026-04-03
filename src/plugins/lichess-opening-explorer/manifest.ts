import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Lichess Opening Explorer',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description: 'Show master openings for the current position',
    license: 'MIT',
    version: '0.1',
    grant: 'GM.xmlHttpRequest',
    connect: 'explorer.lichess.ovh',
    match: 'https://lichess.org/*',
    icon: 'https://icons.duckduckgo.com/ip3/lichess.org.ico',
    supportURL: 'https://github.com/bricemciver/GreasemonkeyScripts/issues',
  }
}
