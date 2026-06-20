# GreasemonkeyScripts

Parent project to hold all my Greasemonkey scripts

<!-- TOC -->

- [INSTALLATION](#installation)
- [SCRIPTS](#scripts)
  - [Amazon](#amazon)
  - [Ancestry](#ancestry)
  - [Breeze](#breeze)
  - [eBay](#ebay)
  - [Equip-Bid](#equip-bid)
  - [Facebook](#facebook)
  - [Gutenberg](#gutenberg)
  - [Lichess](#lichess)
  - [Microcenter](#microcenter)
  - [Pastebin Tools](#pastebin-tools)
  - [ThisIsWhyImBroke](#thisiswhyimbroke)
  - [Word Games](#word-games)
- [DEVELOPMENT](#development)
- [SEE ALSO](#see-also)

<!-- TOC END -->

# INSTALLATION

Unless otherwise noted, each link below points to the userscript's homepage on
[GreasyFork](https://greasyfork.org/en/users/9112-bricemciver).

Where possible, always install (or reinstall) these userscripts from
GreasyFork, as this repo may contain development versions of these scripts that
aren't ready for release and which may not even compile.

# SCRIPTS

## Amazon

- [Amazon - Add to Goodreads widget](https://greasyfork.org/en/scripts/468321-amazon-add-to-goodreads-widget 'Homepage') - Places an "Add to Goodreads" widget on Amazon book pages
- [Amazon - Goodreads metadata](https://greasyfork.org/en/scripts/468322-amazon-goodreads-metadata 'Homepage') - Shows the ratings from Goodreads on Amazon book pages
- [Amazon - Hide Sponsored](https://greasyfork.org/en/scripts/468326-amazon-hide-sponsored 'Homepage') - Hide sponsored items from Amazon search results
- [Amazon CamelCamelCamel + Keepa Price Charts](https://greasyfork.org/en/scripts/468328-amazon-camelcamelcamel-keepa-price-charts 'Homepage') - Add CamelCamelCamel and Keepa price charts to Amazon product pages

## Ancestry

- [Ancestry.com - Remove paid hints](https://greasyfork.org/en/scripts/468323-ancestry-com-remove-paid-hints 'Homepage') - Removes paid hints on the "All Hints" page and on individual person pages
- [Ancestry Premium Content Blocker](https://greasyfork.org/en/scripts/468329-ancestry-premium-content-blocker 'Homepage') - Preload links and disable those that redirect to signup pages

## Breeze

- [Breeze Sidebar Auto-size](https://greasyfork.org/en/scripts/468330-breeze-sidebar-auto-size 'Homepage') - Size the sidebar to fit the width of the content

## eBay

- [eBay Seller Hider](https://greasyfork.org/en/scripts/468324-ebay-seller-hider 'Homepage') - Hide items from low/poor feedback eBay sellers and sponsored items

## Equip-Bid

- [Equip-Bid Enhancements](https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/equip-bid-enhancements.user.js 'Download') - Stay logged in, recover dropped connections, show all-in cost and bid counts per lot, preview every lot photo in a carousel, and total your watchlist by auction
- [Equip-Bid Keyboard Nav](https://greasyfork.org/en/scripts/468327-equip-bid-keyboard-nav 'Homepage') - Use Feedly-style navigation on Equip Bid auctions

## Facebook

- [Facebook Hide Marketplace Deals](https://greasyfork.org/en/scripts/468331-facebook-hide-marketplace-deals 'Homepage') - Hide the sponsored deals that show up in marketplace searches

## Gutenberg

- [Gutenberg Send to Kindle](https://greasyfork.org/en/scripts/468332-gutenberg-send-to-kindle 'Homepage') - Adds a 'Send to Kindle' button on Project Gutenberg ebook pages to send EPUB3 files directly to your Kindle device via Amazon

## Lichess

- [Lichess Opening Explorer](https://greasyfork.org/en/scripts/468333-lichess-opening-explorer 'Homepage') - Show master openings for the current position

## Microcenter

- [Microcenter sort by stock](https://greasyfork.org/en/scripts/468334-microcenter-sort-by-stock 'Homepage') - Adds an option to sort the search results by number in stock at the selected store

## Pastebin Tools

- [FMHY Base64 Auto Decoder](https://greasyfork.org/en/scripts/485772-fmhy-base64-auto-decoder 'Homepage') - Decode base64-encoded links in some pastebins and make URLs clickable

## ThisIsWhyImBroke

- [ThisIsWhyImBroke Menu Fix](https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/thisiswhyimbroke-menu-fix.user.js 'Download') - Makes the long "Gifts by Recipient / Occasion / Category" navigation dropdowns scrollable

## Word Games

- [Wordle Mild Cheat](https://greasyfork.org/en/scripts/468335-wordle-mild-cheat 'Homepage') - Show all valid words that still exist based on your guesses
- [Quordle Mild Cheat](https://greasyfork.org/en/scripts/468336-quordle-mild-cheat 'Homepage') - Get hints based on the words you've already tried
- [Octordle Mild Cheat](https://greasyfork.org/en/scripts/468337-octordle-mild-cheat 'Homepage') - Give you hints for each game board based on valid remaining words

# Development

To work with these scripts locally:

```sh
git clone https://github.com/bricemciver/GreasemonkeyScripts.git
cd GreasemonkeyScripts
pnpm install
```

## Build

To build all scripts for deployment:

```sh
pnpm run build
```

## Folder Structure

- `src/plugins/` – Individual userscript plugins
- `src/build.ts` – Build scripts
- `dist/` – Compiled output (not tracked in git)

## Requirements

- Node.js (v24+ recommended)
- pnpm

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Pull requests and suggestions are welcome!

# SEE ALSO

- [GreasyFork](https://greasyfork.org/en/users/9112-bricemciver)
