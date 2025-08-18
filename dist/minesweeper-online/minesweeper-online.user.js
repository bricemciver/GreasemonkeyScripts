// ==UserScript==
// @name Minesweeper Online
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @author Brice McIver <github@bricemciver.com>
// @copyright 2025 Brice McIver
// @description Additional functions for minesweeper.online
// @license MIT
// @version 0.0.1
// @match *://minesweeper.online/*
// @icon https://icons.duckduckgo.com/ip3/minesweeper.online.ico
// @grant none
// @run-at document-start
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/minesweeper-online/minesweeper-online.user.ts
  var MinesweeperOnline;
  ((MinesweeperOnline2) => {
    class MinesweeperSolver {
      constructor(grid) {
        this.grid = grid.map((row) => [...row]);
        this.rows = grid.length;
        this.cols = grid[0].length;
      }
      /**
       * Get all adjacent positions for a given cell
       * @param y - vertical position (row)
       * @param x - horizontal position (column)
       */
      getAdjacentPositions(y, x) {
        const adjacent = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue;
            const newY = y + dy;
            const newX = x + dx;
            if (newY >= 0 && newY < this.rows && newX >= 0 && newX < this.cols) {
              adjacent.push({ x: newX, y: newY });
            }
          }
        }
        return adjacent;
      }
      /**
       * Count bombs and unknowns in adjacent cells
       * @param y - vertical position (row)
       * @param x - horizontal position (column)
       */
      analyzeAdjacent(y, x) {
        const adjacent = this.getAdjacentPositions(y, x);
        let bombs = 0;
        let clears = 0;
        const unknowns = [];
        for (const pos of adjacent) {
          const cell = this.grid[pos.y][pos.x];
          if (cell === 9) {
            bombs++;
          } else if (cell === -1) {
            unknowns.push(pos);
          } else if (cell >= 0 && cell <= 8) {
            clears++;
          }
        }
        return { bombs, unknowns, clears };
      }
      /**
       * Apply basic minesweeper logic rules
       */
      applyBasicRules() {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
            const cell = this.grid[y][x];
            if (cell >= 1 && cell <= 8) {
              const { bombs, unknowns } = this.analyzeAdjacent(y, x);
              if (bombs === cell && unknowns.length > 0) {
                for (const pos of unknowns) {
                  this.grid[pos.y][pos.x] = 0;
                  newClears.push(pos);
                  changed = true;
                }
              } else if (bombs + unknowns.length === cell && unknowns.length > 0) {
                for (const pos of unknowns) {
                  this.grid[pos.y][pos.x] = 9;
                  newBombs.push(pos);
                  changed = true;
                }
              }
            }
          }
        }
        return { newBombs, newClears, changed };
      }
      /**
       * Apply advanced constraint satisfaction techniques
       */
      applyAdvancedRules() {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        const constraintCells = [];
        for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
            const cell = this.grid[y][x];
            if (cell >= 1 && cell <= 8) {
              const { bombs, unknowns } = this.analyzeAdjacent(y, x);
              const remainingBombs = cell - bombs;
              if (unknowns.length > 0 && remainingBombs > 0) {
                constraintCells.push({
                  pos: { x, y },
                  value: cell,
                  unknowns,
                  remainingBombs
                });
              }
            }
          }
        }
        for (let i = 0; i < constraintCells.length; i++) {
          for (let j = i + 1; j < constraintCells.length; j++) {
            const cell1 = constraintCells[i];
            const cell2 = constraintCells[j];
            const unknowns1Set = new Set(cell1.unknowns.map((p) => `${p.x},${p.y}`));
            const unknowns2Set = new Set(cell2.unknowns.map((p) => `${p.x},${p.y}`));
            if (cell1.unknowns.every((p) => unknowns2Set.has(`${p.x},${p.y}`))) {
              const difference = cell2.unknowns.filter((p) => !unknowns1Set.has(`${p.x},${p.y}`));
              const bombDifference = cell2.remainingBombs - cell1.remainingBombs;
              if (bombDifference === 0 && difference.length > 0) {
                for (const pos of difference) {
                  if (this.grid[pos.y][pos.x] === -1) {
                    this.grid[pos.y][pos.x] = 0;
                    newClears.push(pos);
                    changed = true;
                  }
                }
              } else if (bombDifference === difference.length && difference.length > 0) {
                for (const pos of difference) {
                  if (this.grid[pos.y][pos.x] === -1) {
                    this.grid[pos.y][pos.x] = 9;
                    newBombs.push(pos);
                    changed = true;
                  }
                }
              }
            } else if (cell2.unknowns.every((p) => unknowns1Set.has(`${p.x},${p.y}`))) {
              const difference = cell1.unknowns.filter((p) => !unknowns2Set.has(`${p.x},${p.y}`));
              const bombDifference = cell1.remainingBombs - cell2.remainingBombs;
              if (bombDifference === 0 && difference.length > 0) {
                for (const pos of difference) {
                  if (this.grid[pos.y][pos.x] === -1) {
                    this.grid[pos.y][pos.x] = 0;
                    newClears.push(pos);
                    changed = true;
                  }
                }
              } else if (bombDifference === difference.length && difference.length > 0) {
                for (const pos of difference) {
                  if (this.grid[pos.y][pos.x] === -1) {
                    this.grid[pos.y][pos.x] = 9;
                    newBombs.push(pos);
                    changed = true;
                  }
                }
              }
            }
          }
        }
        return { newBombs, newClears, changed };
      }
      /**
       * Solve the minesweeper grid using logical deduction
       */
      solve() {
        const allNewBombs = [];
        const allNewClears = [];
        let totalChanged = false;
        let iterations = 0;
        const maxIterations = 100;
        while (iterations < maxIterations) {
          iterations++;
          const basicResult = this.applyBasicRules();
          allNewBombs.push(...basicResult.newBombs);
          allNewClears.push(...basicResult.newClears);
          const advancedResult = this.applyAdvancedRules();
          allNewBombs.push(...advancedResult.newBombs);
          allNewClears.push(...advancedResult.newClears);
          const changed = basicResult.changed || advancedResult.changed;
          totalChanged = totalChanged || changed;
          if (!changed) {
            break;
          }
        }
        return {
          grid: this.grid,
          newBombs: allNewBombs,
          newClears: allNewClears,
          changed: totalChanged
        };
      }
    }
    const classToValue = {
      hdd_flag: 9,
      hdd_type0: 0,
      hdd_type1: 1,
      hdd_type2: 2,
      hdd_type3: 3,
      hdd_type4: 4,
      hdd_type5: 5,
      hdd_type6: 6,
      hdd_type7: 7,
      hdd_type8: 8
    };
    const processChange = (element) => {
      const xString = element.getAttribute("data-x");
      const yString = element.getAttribute("data-y");
      let value = -1;
      for (const [cls, val] of Object.entries(classToValue)) {
        if (element.classList.contains(cls)) {
          value = val;
          break;
        }
      }
      if (xString && yString) {
        const x = parseInt(xString, 10);
        const y = parseInt(yString, 10);
        return { x, y, value };
      }
      return null;
    };
    let detectionTimeout;
    const DEBOUNCE_MS = 500;
    const OVERLAY_ID = "minesweeper-solver-overlay";
    function createOverlayFragment(knownMines, knownSafe) {
      const fragment = document.createDocumentFragment();
      function createHighlightDiv(pos, color) {
        const cell = document.getElementById(`cell_${pos.x}_${pos.y}`);
        if (!cell) return null;
        if (!cell.classList.contains("hdd_closed")) {
          return null;
        }
        const highlight = document.createElement("div");
        highlight.style.position = "absolute";
        highlight.style.left = `${cell.offsetLeft}px`;
        highlight.style.top = `${cell.offsetTop}px`;
        highlight.style.width = `${cell.offsetWidth}px`;
        highlight.style.height = `${cell.offsetHeight}px`;
        highlight.style.pointerEvents = "none";
        highlight.style.boxSizing = "border-box";
        highlight.style.border = `2px solid ${color}`;
        highlight.style.borderRadius = "3px";
        highlight.style.zIndex = "1";
        return highlight;
      }
      for (const mine of knownMines) {
        const div = createHighlightDiv(mine, "red");
        if (div) fragment.appendChild(div);
      }
      for (const safe of knownSafe) {
        const div = createHighlightDiv(safe, "green");
        if (div) fragment.appendChild(div);
      }
      return fragment;
    }
    function updateOverlay(knownMines, knownSafe) {
      const old = document.getElementById(OVERLAY_ID);
      if (old == null ? void 0 : old.parentElement) old.parentElement.removeChild(old);
      const board = document.getElementById("game");
      if (!board) return;
      const gameBoard = board;
      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.style.position = "absolute";
      overlay.style.left = "0";
      overlay.style.top = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "9999";
      overlay.style.left = `${gameBoard.offsetLeft}px`;
      overlay.style.top = `${gameBoard.offsetTop}px`;
      overlay.style.width = `${gameBoard.offsetWidth}px`;
      overlay.style.height = `${gameBoard.offsetHeight}px`;
      overlay.appendChild(createOverlayFragment(knownMines, knownSafe));
      board.appendChild(overlay);
    }
    const createGrid = () => {
      const grid = [];
      const cells = document.querySelectorAll("#AreaBlock .cell");
      for (const cell of cells) {
        const cellData = processChange(cell);
        if (cellData) {
          if (!grid[cellData.y]) {
            grid[cellData.y] = [];
          }
          grid[cellData.y][cellData.x] = cellData.value;
        }
      }
      return grid;
    };
    const scheduleDetection = () => {
      if (detectionTimeout !== void 0) {
        clearTimeout(detectionTimeout);
      }
      detectionTimeout = window.setTimeout(() => {
        const grid = createGrid();
        const solver = new MinesweeperSolver(grid);
        const result = solver.solve();
        const knownMines = result.newBombs;
        const knownSafe = result.newClears;
        updateOverlay(knownMines, knownSafe);
        detectionTimeout = void 0;
      }, DEBOUNCE_MS);
    };
    const gameObserver = new MutationObserver((records) => {
      for (const record of records) {
        if (record.attributeName) {
          const element = record.target;
          if (element.classList.contains("cell")) {
            scheduleDetection();
          }
        }
      }
    });
    MinesweeperOnline2.main = () => {
      gameObserver.observe(document, { subtree: true, childList: true, attributeFilter: ["class"] });
    };
  })(MinesweeperOnline || (MinesweeperOnline = {}));
  MinesweeperOnline.main();
})();
//# sourceMappingURL=minesweeper-online.user.js.map
