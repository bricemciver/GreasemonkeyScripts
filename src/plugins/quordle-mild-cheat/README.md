# Quordle Mild Cheat

A userscript that gives you hints based on the words you've already tried

## What it does

This script enhances the Quordle game experience by providing hints for each of the four game boards. It analyzes the game's word bank and allowed words list, then filters possible solutions based on your previous guesses. When you press '?', it displays dialogs with word lists for each board, highlighting words from the official word bank in bold (indicating they're more likely to be correct solutions).

## Features

- **Four-board Support**: Works with all four Quordle boards simultaneously
- **Smart Hint Generation**: Filters valid words based on game state and previous guesses
- **Word Bank Highlighting**: Words from the official word bank appear in bold
- **Keyboard Activation**: Press '?' to show/hide the word list dialog
- **Escape to Close**: Press 'Esc' to close the word list dialog
- **Session Storage**: Caches word lists to avoid repeated retrieval
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/quordle-mild-cheat.user.js>

## How to Use

1. **Navigate to Quordle**: Go to https://www.merriam-webster.com/games/quordle and start playing
2. **Play the game**: Make your guesses as normal
3. **Get hints**: Press the '?' key to see word lists for each board
4. **Interpret results**: Words shown in bold are from the official word bank and more likely to be correct
5. **Close dialog**: Press 'Esc' to close the word list dialog when done