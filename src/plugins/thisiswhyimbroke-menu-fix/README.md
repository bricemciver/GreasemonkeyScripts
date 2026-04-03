# ThisIsWhyImBroke Menu Fix

A userscript that makes the long "Gifts by Recipient / Occasion / Category" navigation dropdowns scrollable

## What it does

This script fixes the navigation dropdown menus on ThisIsWhyImBroke by making them scrollable when they extend beyond the viewport. The dropdown menus use absolute positioning, which causes the page to scroll instead of the menu. This script detects overflowing dropdowns, clamps their height, and makes them scrollable in-place.

## Features

- **Auto-Detection**: Automatically finds and fixes navigation dropdowns
- **Scroll Isolation**: Prevents page scrolling while scrolling within dropdown menus
- **Touch Support**: Works on mobile devices with touch scrolling
- **Slim Scrollbars**: Adds subtle scrollbar styling for a cleaner look
- **Cross-Device**: Works on desktop and mobile browsers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/thisiswhyimbroke-menu-fix.user.js>

## How to Use

1. **Navigate to ThisIsWhyImBroke**: Visit https://www.thisiswhyimbroke.com/
2. **Hover over navigation**: Move your mouse over the "Gifts by..." dropdown menus
3. **Scroll within menus**: The long dropdown lists will now be scrollable within the viewport instead of causing the page to scroll
