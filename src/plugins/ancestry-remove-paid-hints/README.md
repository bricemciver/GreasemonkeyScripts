# Ancestry.com - Remove paid hints

A userscript that removes paid hints on the "All Hints" page and on individual person pages

## What it does

This script enhances the Ancestry.com experience by automatically detecting and removing paid hints from your view. It uses IndexedDB to track which hints require a subscription and hides them from the "All Hints" page and individual person pages, allowing you to focus only on free hints available with your current subscription level.

## Features

- **Paid Hint Detection**: Automatically identifies hints that require a paid subscription
- **IndexedDB Storage**: Efficiently stores hint information to avoid repeated checks
- **Multi-page Support**: Works on both the "All Hints" page and individual person pages
- **Offer Page Handling**: Properly marks collections as paid when encountered on offer pages
- **Dynamic Content Handling**: Works with dynamically loaded content via MutationObserver
- **Cross-domain Support**: Works on both ancestry.com and ancestry.de domains
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/ancestry-remove-paid-hints.user.js>

## How to Use

1. **Navigate to Ancestry.com hints pages**: Go to either the "All Hints" page or an individual person's hints page
2. **Observe the results**: Paid hints will be automatically removed from view
3. **Focus on free hints**: Your hints list will now show only hints available with your current subscription