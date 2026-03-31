import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'FMHY Base64 Auto Decoder',
    version: '2.4',
    author: 'Rust1667',
    description: 'Decode base64-encoded links in some pastebins and make URLs clickable',
    match: [
      '*://rentry.co/*',
      '*://rentry.org/*',
      '*://pastes.fmhy.net/*',
      '*://bin.disroot.org/?*#*',
      '*://privatebin.net/?*#*',
      '*://textbin.xyz/?*#*',
      '*://bin.idrix.fr/?*#*',
      '*://privatebin.rinuploads.org/?*#*',
      '*://pastebin.com/*',
    ],
    grant: 'none',
    icon: 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://fmhy.net&size=64',
    namespace: 'https://greasyfork.org/users/980489',
    downloadURL: 'https://update.greasyfork.org/scripts/485772/FMHY%20Base64%20Auto%20Decoder.user.js',
    updateURL: 'https://update.greasyfork.org/scripts/485772/FMHY%20Base64%20Auto%20Decoder.meta.js',
  }
}
