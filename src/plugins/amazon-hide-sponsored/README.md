# Amazon - Hide Sponsored

A userscript that hides sponsored items from search results

## What it does

This script automatically detects and hides sponsored items in Amazon search results. It works by finding elements containing the text "Sponsored" and hiding their parent containers that have a data-asin attribute, effectively removing sponsored products from your search results page.

## Features

- **Sponsored Item Detection**: Automatically finds sponsored items by looking for "Sponsored" text labels
- **Clean Removal**: Completely hides sponsored product containers from the page
- **Cross-domain Support**: Works on all Amazon domains (.com, .co.uk, .ca, .de, .fr, .es, .it, .co.jp, .cn, .com.br, .in, .com.mx, .com.au)
- **Lightweight**: Simple and efficient implementation with minimal DOM manipulation
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/amazon-hide-sponsored.user.js>

## How to Use

1. **Navigate to an Amazon search results page**: Go to any Amazon search results page
2. **Observe the results**: Sponsored items will be automatically hidden from view
3. **Enjoy cleaner results**: Your search results will now show only organic products without sponsored clutter