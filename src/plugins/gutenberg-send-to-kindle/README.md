# Gutenberg Send to Kindle

A userscript that adds a 'Send to Kindle' button on Project Gutenberg ebook pages to send EPUB3 files directly to your Kindle device via Amazon

## What it does

This script enhances Project Gutenberg ebook pages by adding a "Send to Kindle" button that allows you to send EPUB3 files directly to your Kindle device. It handles the entire process of retrieving the EPUB file, initializing the Amazon Send-to-Kindle service, uploading the file, and sending it to your registered Kindle device.

## Features

- **Direct Kindle Integration**: Sends EPUB3 files from Project Gutenberg directly to your Kindle via Amazon's Send-to-Kindle service
- **Automatic Metadata Extraction**: Automatically extracts book title and author from the Gutenberg page
- **File Size Detection**: Uses HEAD requests to determine file size before downloading
- **Secure Authentication**: Handles Amazon CSRF tokens and authentication properly
- **User Feedback**: Provides toast notifications for success, error, and info states
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/gutenberg-send-to-kindle.user.js>

## How to Use

1. **Navigate to a Project Gutenberg ebook page**: Go to any ebook page on gutenberg.org (e.g., https://www.gutenberg.org/ebooks/1234)
2. **Look for the button**: A "📧 Send to Kindle" button will appear near the download options
3. **Click the button**: Click the button to send the EPUB3 version of the book to your Kindle
4. **Receive confirmation**: You'll see a success toast notification when the book has been sent to your Kindle
5. **Requirements**: You must be logged into Amazon for this to work properly

## Notes

- Only works with EPUB3 formats on Project Gutenberg
- Requires an active Amazon account with Send-to-Kindle set up
- The script handles all communication with Amazon's Send-to-Kindle API securely