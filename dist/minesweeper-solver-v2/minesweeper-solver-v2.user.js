// ==UserScript==
// @name Minesweeper Solver v2
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
  // src/main/minesweeper-solver-v2/minesweeper-solver-v2.user.ts
  var MinesweeperSolver;
  ((MinesweeperSolver2) => {
    class InconsistencyError extends Error {
      constructor(message) {
        super(message);
        this.name = "InconsistencyError";
      }
    }
    const _Solver = class _Solver {
      constructor(board) {
        this.createRule = (numMines, cells) => {
          return {
            numMines,
            cells: new Set(cells.map(_Solver.cellToString))
          };
        };
        this.isRuleTrivial = (rule) => {
          return rule.numMines === 0 || rule.numMines === rule.cells.size;
        };
        this.getDefiniteCells = (rule) => {
          if (rule.numMines === 0) {
            return { mines: /* @__PURE__ */ new Set(), safe: new Set(rule.cells) };
          } else if (rule.numMines === rule.cells.size) {
            return { mines: new Set(rule.cells), safe: /* @__PURE__ */ new Set() };
          } else {
            return { mines: /* @__PURE__ */ new Set(), safe: /* @__PURE__ */ new Set() };
          }
        };
        this.subtractRule = (superRule, subRule) => {
          for (const cell of subRule.cells) {
            if (!superRule.cells.has(cell)) {
              return null;
            }
          }
          const remainingCells = new Set(superRule.cells);
          for (const cell of subRule.cells) {
            remainingCells.delete(cell);
          }
          return {
            numMines: superRule.numMines - subRule.numMines,
            cells: remainingCells
          };
        };
        this.getNeighbors = (row, col, maxRow, maxCol) => {
          const neighbors = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const newRow = row + dr;
              const newCol = col + dc;
              if (newRow >= 0 && newRow < maxRow && newCol >= 0 && newCol < maxCol) {
                neighbors.push([newRow, newCol]);
              }
            }
          }
          return neighbors;
        };
        this.solveDefinite = (rules) => {
          const ruleSet = new Set(rules);
          const definiteMines = /* @__PURE__ */ new Set();
          const definiteSafe = /* @__PURE__ */ new Set();
          let changed = true;
          while (changed) {
            changed = false;
            const trivialRules = [];
            for (const rule of ruleSet) {
              if (this.isRuleTrivial(rule)) {
                const { mines, safe } = this.getDefiniteCells(rule);
                for (const mine of mines) definiteMines.add(mine);
                for (const safeCell of safe) definiteSafe.add(safeCell);
                trivialRules.push(rule);
                changed = true;
              }
            }
            for (const rule of trivialRules) {
              ruleSet.delete(rule);
            }
            for (const trivialRule of trivialRules) {
              const rulesToReplace = [];
              for (const rule of ruleSet) {
                const reduced = this.subtractRule(rule, trivialRule);
                if (reduced !== null) {
                  if (reduced.numMines < 0 || reduced.numMines > reduced.cells.size) {
                    throw new InconsistencyError("Invalid rule after reduction");
                  }
                  rulesToReplace.push({ old: rule, new: reduced });
                  changed = true;
                }
              }
              for (const { old, new: newRule } of rulesToReplace) {
                ruleSet.delete(old);
                ruleSet.add(newRule);
              }
            }
            const rulesArray = Array.from(ruleSet);
            let foundSubsetReduction = false;
            for (let i = 0; i < rulesArray.length && !foundSubsetReduction; i++) {
              for (let j = i + 1; j < rulesArray.length && !foundSubsetReduction; j++) {
                const rule1 = rulesArray[i];
                const rule2 = rulesArray[j];
                const rule1IsSubset = Array.from(rule1.cells).every((cell) => rule2.cells.has(cell));
                if (rule1IsSubset && rule1.cells.size < rule2.cells.size) {
                  const reduced = this.subtractRule(rule2, rule1);
                  if (reduced !== null && reduced.numMines >= 0) {
                    ruleSet.delete(rule2);
                    ruleSet.add(reduced);
                    changed = true;
                    foundSubsetReduction = true;
                  }
                }
                const rule2IsSubset = Array.from(rule2.cells).every((cell) => rule1.cells.has(cell));
                if (rule2IsSubset && rule2.cells.size < rule1.cells.size) {
                  const reduced = this.subtractRule(rule1, rule2);
                  if (reduced !== null && reduced.numMines >= 0) {
                    ruleSet.delete(rule1);
                    ruleSet.add(reduced);
                    changed = true;
                    foundSubsetReduction = true;
                  }
                }
              }
            }
          }
          return { mines: definiteMines, safe: definiteSafe };
        };
        this.board = board;
      }
      boardToRules(board) {
        const rows = board.length;
        const cols = board[0].length;
        const rules = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellValue = board[r][c];
            if (cellValue < 0 || cellValue > 8) {
              continue;
            }
            const neighbors = this.getNeighbors(r, c, rows, cols);
            const unknownNeighbors = [];
            let knownMines = 0;
            for (const [nr, nc] of neighbors) {
              const neighborValue = board[nr][nc];
              if (neighborValue === -1) {
                unknownNeighbors.push([nr, nc]);
              } else if (neighborValue === 9) {
                knownMines++;
              }
            }
            if (unknownNeighbors.length > 0) {
              const remainingMines = cellValue - knownMines;
              if (remainingMines < 0) {
                throw new InconsistencyError(`Invalid board state at (${r},${c}): more known mines than indicated`);
              }
              if (remainingMines > unknownNeighbors.length) {
                throw new InconsistencyError(`Invalid board state at (${r},${c}): not enough cells for required mines`);
              }
              rules.push(this.createRule(remainingMines, unknownNeighbors));
            }
          }
        }
        return rules;
      }
      solve() {
        const rules = this.boardToRules(this.board);
        const { mines, safe } = this.solveDefinite(rules);
        return { mines, safe };
      }
    };
    _Solver.cellToString = (cell) => {
      return `${cell[0]},${cell[1]}`;
    };
    _Solver.stringToCell = (str) => {
      const [r, c] = str.split(",").map(Number);
      return [r, c];
    };
    let Solver = _Solver;
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
      hdd_type8: 8,
      hd_flag: 9,
      hd_type0: 0,
      hd_type1: 1,
      hd_type2: 2,
      hd_type3: 3,
      hd_type4: 4,
      hd_type5: 5,
      hd_type6: 6,
      hd_type7: 7,
      hd_type8: 8,
      hdn_flag: 9,
      hdn_type0: 0,
      hdn_type1: 1,
      hdn_type2: 2,
      hdn_type3: 3,
      hdn_type4: 4,
      hdn_type5: 5,
      hdn_type6: 6,
      hdn_type7: 7,
      hdn_type8: 8,
      ald_flag: 9,
      ald_type0: 0,
      ald_type1: 1,
      ald_type2: 2,
      ald_type3: 3,
      ald_type4: 4,
      ald_type5: 5,
      ald_type6: 6,
      ald_type7: 7,
      ald_type8: 8,
      nnhdd_flag: 9,
      nnhdd_type0: 0,
      nnhdd_type1: 1,
      nnhdd_type2: 2,
      nnhdd_type3: 3,
      nnhdd_type4: 4,
      nnhdd_type5: 5,
      nnhdd_type6: 6,
      nnhdd_type7: 7,
      nnhdd_type8: 8
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
    const getCellElement = (pos) => {
      const cell = Solver.stringToCell(pos);
      return document.getElementById(`cell_${cell[1]}_${cell[0]}`);
    };
    const isCellClosed = (cell) => {
      return cell.classList.contains("hdd_closed");
    };
    let detectionTimeout;
    const DEBOUNCE_MS = 500;
    const OVERLAY_ID = "minesweeper-solver-overlay";
    const createHighlightDiv = (pos, color) => {
      const cell = getCellElement(pos);
      if (!cell) return null;
      if (!isCellClosed(cell)) return null;
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
    };
    const createOverlayFragment = (knownMines, knownSafe) => {
      const fragment = document.createDocumentFragment();
      for (const mine of knownMines) {
        const div = createHighlightDiv(mine, "red");
        if (div) fragment.appendChild(div);
      }
      for (const safe of knownSafe) {
        const div = createHighlightDiv(safe, "green");
        if (div) fragment.appendChild(div);
      }
      return fragment;
    };
    const updateOverlay = (knownMines, knownSafe) => {
      removeOverlay();
      const board = document.getElementById("game");
      if (!board) return;
      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.style.pointerEvents = "none";
      overlay.appendChild(createOverlayFragment(knownMines, knownSafe));
      board.appendChild(overlay);
    };
    const removeOverlay = () => {
      const old = document.getElementById(OVERLAY_ID);
      if (old == null ? void 0 : old.parentElement) old.parentElement.removeChild(old);
    };
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
    function scheduleDetection() {
      if (detectionTimeout !== void 0) {
        clearTimeout(detectionTimeout);
      }
      detectionTimeout = window.setTimeout(runSolverAndUpdateOverlay, DEBOUNCE_MS);
    }
    function runSolverAndUpdateOverlay() {
      const grid = createGrid();
      const solver = new Solver(grid);
      const result = solver.solve();
      const knownMines = result.mines;
      const knownSafe = result.safe;
      updateOverlay(knownMines, knownSafe);
      detectionTimeout = void 0;
    }
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
    MinesweeperSolver2.main = () => {
      gameObserver.observe(document, {
        subtree: true,
        childList: true,
        attributeFilter: ["class"]
      });
    };
  })(MinesweeperSolver || (MinesweeperSolver = {}));
  MinesweeperSolver.main();
})();
//# sourceMappingURL=minesweeper-solver-v2.user.js.map
