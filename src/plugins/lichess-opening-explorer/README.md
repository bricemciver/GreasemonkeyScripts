# Lichess Opening Explorer

A userscript that shows master openings for the current position

## What it does

This script enhances the Lichess chess experience by displaying master-level opening moves for the current position on the board. It extracts the moves from the current game, queries the Lichess Opening Explorer database, and shows the top move played by masters in that position.

## Features

- **Real-time Analysis**: Automatically analyzes the current position as moves are made
- **Master Game Data**: Shows opening moves from master-level games in the Lichess database
- **UCI Notation Display**: Displays the top move in Universal Chess Interface (UCI) format
- **Caching System**: Uses browser caching to reduce redundant requests to the opening explorer
- **Dynamic Updates**: Updates automatically when new moves are made in the game
- **Easy Installation**: Compatible with Tampermonkey, Greasemonkey, and other userscript managers

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Download the userscript from <https://github.com/bricemciver/GreasemonkeyScripts/releases/latest/download/lichess-opening-explorer.user.js>

## How to Use

1. **Navigate to Lichess**: Go to any page on lichess.org where you can play or analyze a game
2. **Start or load a game**: Begin playing a game or load an existing game
3. **Observe the top move**: As you make moves, the script will display the top master move for the current position
4. **Improve your opening play**: Use the displayed master moves to learn and improve your opening repertoire