# Amazon CamelCamelCamel + Keepa Price Charts

A userscript that adds CamelCamelCamel and Keepa price charts to Amazon product pages.

## What it does

This script enhances Amazon product pages by adding price history charts from CamelCamelCamel and Keepa services. It automatically detects the product ASIN, determines the appropriate Amazon domain, and injects interactive price history charts that allow users to view historical pricing data directly on the product page.

## Features

- **Multi-method ASIN Detection**: Uses multiple strategies to reliably extract ASIN from Amazon pages
- **Cross-domain Support**: Works on all major Amazon domains including .com, .co.uk, .de, .fr, .it, .es, .ca, .co.jp, .in, .com.br, .com.mx, .com.au, .nl, .sg, .ae, .sa, .se, .pl, .com.tr, .eg, .com.be
- **Interactive Charts**: Displays price history charts from both CamelCamelCamel and Keepa services
- **Collapsible Interface**: Charts can be collapsed/expanded to save space
- **Dynamic Content Handling**: Works with Amazon's dynamic page updates and SPA navigation
- **Error Handling**: Gracefully handles cases where charts cannot be loaded
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/amazon-camelcamelcamel-keepa-price-charts.user.js>

## How to Use

1. **Navigate to an Amazon product page**: Go to any Amazon product page
2. **Look for the charts section**: The "Price History Charts" section will appear near the product details
3. **View price history**: Click on the CamelCamelCamel or Keepa charts to see detailed price history
4. **Collapse/expand**: Click the header to collapse or expand the charts section as needed