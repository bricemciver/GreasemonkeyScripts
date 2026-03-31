import type { MonkeyUserScript } from 'vite-plugin-monkey'
export function manifest(): MonkeyUserScript {
  return {
    name: 'Gutenberg Send to Kindle',
    namespace: 'https://github.com/bricemciver/GreasemonekeyScripts',
    description:
      "Adds a 'Send to Kindle' button on Project Gutenberg ebook pages to send EPUB3 files directly to your Kindle device via Amazon",
    license: 'MIT',
    version: '0.1',
    match: ['https://www.gutenberg.org/ebooks/*', 'https://gutenberg.org/ebooks/*'],
    icon: 'https://icons.duckduckgo.com/ip3/gutenberg.org.ico',
    grant: 'GM.xmlHttpRequest',
    connect: ['amazon.com', 'gutenberg.org'],
    'run-at': 'document-end',
  }
}
