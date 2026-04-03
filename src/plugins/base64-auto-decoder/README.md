# FMHY Base64 Auto Decoder

A userscript that decodes base64-encoded links in some pastebins and makes URLs clickable

## What it does

This script automatically detects base64-encoded strings on various pastebin and text sharing websites, decodes them, and converts any URLs found within the decoded content into clickable links. It supports multiple pastebin services including Pastebin, Rentry, PrivateBin, and others.

## Features

- **Multi-service Support**: Works on Pastebin, Rentry, Rentry.org, Pastes.FMHY.net, PrivateBin instances, TextBin, Bin.Disroot.org, Bin.Idrix.fr, and more
- **Base64 Detection**: Automatically identifies base64-encoded strings using regex pattern matching
- **URL Conversion**: Converts decoded URLs into clickable links that open in the same tab
- **Multi-line Support**: Handles both single-line and multi-line base64 encoded content
- **Visual Preservation**: Maintains original text styling when converting to links
- **Smart Service Detection**: Uses different decoding strategies based on the website being visited
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/base64-auto-decoder.user.js>

## How to Use

1. **Navigate to a supported pastebin site**: Go to any of the supported websites (Pastebin, Rentry, PrivateBin, etc.)
2. **Look for base64 content**: Find pages containing base64-encoded strings (often starting with patterns like "aHR0" or enclosed in backticks)
3. **Observe automatic conversion**: The script will automatically detect, decode, and convert any URLs in the base64 content to clickable links
4. **Click links**: Click on the newly created links to visit the decoded URLs directly