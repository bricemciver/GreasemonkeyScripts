# Octordle Mild Cheat

A userscript that gives you hints for each game board based on valid remaining words

## What it does

This script enhances the Octordle game experience by providing hints for each of the eight game boards. It analyzes the current state of each board (correct letters, misplaced letters, and eliminated letters) and filters the word bank to show only valid remaining words that could solve each board. When you press '?', it displays a dialog with word lists for each board, highlighting words that are still possible solutions in bold.

## Features

- **Eight-board Support**: Works with all eight Octordle boards simultaneously
- **Smart Hint Generation**: Filters valid words based on game state for each board
- **Visual Indicators**: Correct letters are shown in bold in the word list
- **Keyboard Activation**: Press '?' to show/hide the word list dialog
- **Escape to Close**: Press 'Esc' to close the word list dialog
- **Session Storage**: Caches word lists to avoid repeated retrieval
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/octordle-mild-cheat.user.js>

## How to Use

1. **Navigate to Octordle**: Go to https://www.britannica.com/games/octordle and start playing
2. **Play the game**: Make your guesses as normal
3. **Get hints**: Press the '?' key to see word lists for each board
4. **Interpret results**: Words shown in bold are still valid solutions for that board based on current clues
5. **Close dialog**: Press 'Esc' to close the word list dialog when done