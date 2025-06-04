# GreasemonkeyScripts

Parent project to hold all my Greasemonkey scripts

<!-- TOC -->

- [INSTALLATION](#installation)
- [SCRIPTS](#scripts)
  - [Sites](#sites)
    - [Amazon](#amazon)
    - [Ancestry](#ancestry)
    - [EBay](#ebay)
    - [Equip-Bid](#equip-bid)
    - [Wirecutter](#wirecutter)
- [DEVELOPMENT](#development)
- [SEE ALSO](#see-also)
  - [Sites](#sites-1)

<!-- TOC END -->

# INSTALLATION

Unless otherwise noted, each link below points to the userscript's homepage on
[GreasyFork](https://greasyfork.org/en/users/9112-bricemciver).

Where possible, always install (or reinstall) these userscripts from
GreasyFork, as this repo may contain development versions of these scripts that
aren't ready for release and which may not even compile.

# SCRIPTS

## Sites

### Amazon

- [Amazon - Add to Goodreads widget](https://greasyfork.org/en/scripts/468321-amazon-add-to-goodreads-widget 'Homepage') - Places an "Add to Goodreads" widget on Amazon book pages
- [Amazon - Goodreads metadata](https://greasyfork.org/en/scripts/468322-amazon-goodreads-metadata 'Homepage') - Shows the ratings from Goodreads on Amazon book pages
- [Amazon - Hide Sponsored] - Hides sponsored items in Amazon search results

### Ancestry

- [Ancestry.com - Remove paid hints](https://greasyfork.org/en/scripts/468323-ancestry-com-remove-paid-hints 'Homepage') - Removes paid hints on the "All Hints" page and on individual person pages

### EBay

- [eBay Seller Hider](https://greasyfork.org/en/scripts/468324-ebay-seller-hider 'Homepage') - Hide items from low/poor feedback eBay sellers and sponsored items

### Equip-Bid

- [Equip-Bid Keyboard Nav](https://greasyfork.org/en/scripts/468327-equip-bid-keyboard-nav 'Homepage') - Use Feedly-style navigation on Equip Bid auctions

### Wirecutter

- [Wirecutter Anti-modal](https://greasyfork.org/en/scripts/468325-wirecutter-anti-modal 'Homepage') - Stop modals asking you to register before viewing articles

### Microcenter

- [Microcenter - Sort by stock] - Allows sorting search results by the number of items in stock

# Development

To work with these scripts locally:

```sh
git clone https://github.com/bricemciver/GreasemonkeyScripts.git
cd GreasemonkeyScripts
npm install
```

## Build

To build all scripts for deployment:

```sh
npm run build
```

## Lint and Format

To check code style and formatting:

```sh
npm run lint:check
npm run format:check
```

To automatically fix lint and formatting issues:

```sh
npm run lint
npm run format
```

## Folder Structure

- `src/main/` – Main userscript source files
- `src/scripts/` – Build and utility scripts
- `dist/` – Compiled output (not tracked in git)

## Requirements

- Node.js (v18+ recommended)
- npm

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Pull requests and suggestions are welcome!

# SEE ALSO

## Sites

- [GreasyFork](https://greasyfork.org/en/users/9112-bricemciver)
- [OpenUserJS](https://openuserjs.org/users/bricem)
