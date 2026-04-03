# Ancestry Premium Content Blocker

A userscript that preloads links and disables those that redirect to signup pages

## What it does

This script enhances the Ancestry.com experience by automatically detecting and blocking links that lead to subscription/paywall pages. It preloads links on the page, checks if they redirect to signup pages, and visually disables them so users can easily distinguish between free content and content requiring a subscription.

## Features

- **Link Preloading**: Automatically checks all links on Ancestry.com pages
- **Signup Page Detection**: Identifies links leading to subscription pages using multiple indicators
- **Visual Disabling**: Blocks signup links with visual cues (dimmed text, line-through, not-allowed cursor, lock indicator)
- **Smart Caching**: Caches results to avoid re-checking the same links and reduce server load
- **Dynamic Content Handling**: Works with dynamically loaded content via MutationObserver
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/ancestry-premium-content-blocker.user.js>

## How to Use

1. **Navigate to an Ancestry.com page**: Go to any page on Ancestry.com
2. **Observe the links**: Links that require a subscription will be automatically disabled and marked with a visual indicator
3. **Focus on free content**: Easily identify which links lead to free content vs. subscription-only content