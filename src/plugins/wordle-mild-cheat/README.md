# Wordle Mild Cheat

A userscript that will show you all of the valid words that still exist based on your guesses

## What it does

This script enhances the Wordle game experience by showing all valid words that remain possible solutions based on your previous guesses. It extracts the game's word list from the NYT Wordle script, then filters it according to the feedback from your guesses (correct letters in right position, correct letters in wrong position, and eliminated letters). When you press '?', it displays a dialog with all remaining valid words.

## Features

- **Real-time Filtering**: Dynamically filters the word list based on your guesses and their feedback
- **Complete Word List**: Uses the full official Wordle word list from the game's script
- **Smart Processing**: Correctly handles correct position, misplaced position, and eliminated letters
- **Keyboard Activation**: Press '?' to show/hide the word list dialog
- **Escape to Close**: Press 'Esc' to close the word list dialog
- **Session Storage**: Caches the word list to avoid repeated retrieval
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/wordle-mild-cheat.user.js>

## How to Use

1. **Navigate to Wordle**: Go to https://www.nytimes.com/games/wordle/index.html and start playing
2. **Play the game**: Make your guesses as normal
3. **Get hints**: Press the '?' key to see all remaining valid words based on your guesses
4. **Make informed guesses**: Use the filtered word list to choose your next guess
5. **Close dialog**: Press 'Esc' to close the word list dialog when done