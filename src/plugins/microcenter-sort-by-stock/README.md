# Microcenter sort by stock

A userscript that adds an option to sort the search results by number in stock at the selected store

## What it does

This script enhances the Microcenter shopping experience by adding a "Stock" sorting option to the search results page. When selected, it sorts products by their available stock quantity at the selected store, showing items with the highest inventory first. This helps users quickly find products that are readily available for purchase or pickup.

## Features

- **Stock-based Sorting**: Adds a "Stock" option to the sort dropdown menu
- **Real-time Sorting**: Sorts products by current stock levels (highest to lowest)
- **Visual Feedback**: Updates the sort display to show "Stock" as the active sort option
- **Inventory Parsing**: Correctly interprets stock quantities including special cases like "25+"
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/microcenter-sort-by-stock.user.js>

## How to Use

1. **Navigate to Microcenter**: Go to www.microcenter.com and perform a search
2. **Find the sort menu**: Look for the "Sort by" dropdown near the search results
3. **Select Stock option**: Choose "Stock" from the dropdown menu
4. **View sorted results**: Products will automatically reorder with highest stock items first
5. **Verify sorting**: The sort display will show "Stock" as the active option