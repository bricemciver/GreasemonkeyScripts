# Amazon - Goodreads metadata

A userscript that shows the ratings from Goodreads on Amazon book pages

## What it does

This script enhances Amazon book pages by fetching and displaying Goodreads ratings and review counts. It automatically detects ASINs on Amazon pages (both single product pages and search results), queries Goodreads for book metadata, and displays the Goodreads star rating, number of ratings, and number of reviews directly on the Amazon page.

## Features

- **ASIN Extraction**: Automatically detects ASINs from Amazon pages using multiple methods
- **Goodreads Integration**: Fetches real-time rating data from Goodreads.com
- **Multi-book Support**: Works on both single product pages and search/listing pages with multiple books
- **Clean Presentation**: Displays Goodreads rating in a styled container that matches Amazon's design
- **Cross-domain Support**: Works on all Amazon domains (.com, .co.uk, .ca, .de, .fr, .es, .it, .co.jp, .cn, .com.br, .in, .com.mx, .com.au)
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/amazon-goodreads-meta.user.js>

## How to Use

1. **Navigate to an Amazon book page**: Go to any Amazon product page for a book or browse/search for books
2. **Look for the Goodreads section**: The Goodreads rating and review count will appear near the product details or under each book in search results
3. **View detailed information**: Click the Goodreads link to visit the book's page on Goodreads.com for more details