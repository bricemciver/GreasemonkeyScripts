# Facebook Hide Marketplace Deals

A userscript that hides the sponsored deals that show up in marketplace searches

## What it does

This script automatically detects and removes sponsored "Marketplace Deals" from Facebook Marketplace search results. It uses a MutationObserver to watch for newly added elements and removes any links containing tracking parameters that indicate sponsored content, providing a cleaner browsing experience focused on organic listings.

## Features

- **Sponsored Content Removal**: Automatically hides sponsored Marketplace Deals from search results
- **Dynamic Page Handling**: Uses MutationObserver to handle dynamically loaded content
- **Tracking Link Detection**: Identifies sponsored content by tracking parameters in URLs
- **Clean Removal**: Completely removes sponsored items from the DOM (not just hidden)
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/facebook-hide-marketplace-deals.user.js>

## How to Use

1. **Navigate to Facebook Marketplace**: Go to any Facebook Marketplace search page
2. **Observe the results**: Sponsored "Marketplace Deals" will be automatically removed from view
3. **Enjoy cleaner results**: Your Marketplace search results will now show only organic listings without sponsored clutter