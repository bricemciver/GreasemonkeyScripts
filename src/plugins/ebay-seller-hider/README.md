# eBay Seller Hider

A userscript that hides items from low/poor feedback eBay sellers and sponsored items

## What it does

This script enhances the eBay browsing experience by automatically filtering out items from sellers with low feedback scores or poor feedback percentages, as well as hiding sponsored items. It adds a customizable filter to the eBay sidebar allowing users to set minimum thresholds for review count and feedback percentage, and optionally hide sponsored listings.

## Features

- **Seller Filtering**: Hides items from sellers below configurable feedback thresholds
- **Review Count Filter**: Set minimum number of reviews required for sellers to be shown
- **Feedback Percentage Filter**: Set minimum feedback percentage required for sellers to be shown
- **Sponsored Item Hiding**: Optionally hide sponsored listings from search results
- **Persistent Settings**: Uses localStorage to remember your filter preferences
- **Customizable Interface**: Adds filter controls to the eBay refine sidebar
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/ebay-seller-hider.user.js>

## How to Use

1. **Navigate to eBay**: Go to any eBay search results page
2. **Find the filter controls**: Look for the "Sellers" section in the left-hand refine sidebar
3. **Adjust your preferences**: 
   - Check/uncheck "Review Min" to enable/disable review count filtering
   - Set the minimum number of reviews required (default: 10)
   - Check/uncheck "Feedback Min" to enable/disable feedback percentage filtering
   - Set the minimum feedback percentage required (default: 95.0%)
   - Check/uncheck "Hide sponsored" to enable/disable hiding of sponsored items
4. **Enjoy filtered results**: Items from sellers not meeting your criteria will be automatically hidden