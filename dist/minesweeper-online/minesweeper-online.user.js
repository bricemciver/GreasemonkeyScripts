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
      getConstraintCells() {
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
        return constraintCells;
      }
      analyzeConstraintPair(cell1, cell2) {
        const newBombs = [];
        const newClears = [];
        let changed = false;
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
        return { newBombs, newClears, changed };
      }
      /**
       * Apply advanced constraint satisfaction techniques
       */
      applyAdvancedRules() {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        const constraintCells = this.getConstraintCells();
        for (let i = 0; i < constraintCells.length; i++) {
          for (let j = i + 1; j < constraintCells.length; j++) {
            const result = this.analyzeConstraintPair(constraintCells[i], constraintCells[j]);
            if (result.changed) {
              newBombs.push(...result.newBombs);
              newClears.push(...result.newClears);
              changed = true;
            }
          }
        }
        return { newBombs, newClears, changed };
      }
      solveBruteForce(constraintCells, unknownsList, unknownsMap) {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        const n = unknownsList.length;
        const validSolutions = [];
        for (let mask = 0; mask < 1 << n; mask++) {
          const solution = new Array(n).fill(0);
          for (let i = 0; i < n; i++) {
            if (mask & 1 << i) {
              solution[i] = 1;
            }
          }
          let valid = true;
          for (const constraint of constraintCells) {
            let mineCount = 0;
            for (const pos of constraint.unknowns) {
              const key = `${pos.x},${pos.y}`;
              const index = unknownsMap.get(key);
              if (index !== void 0 && solution[index] === 1) {
                mineCount++;
              }
            }
            if (mineCount !== constraint.remainingBombs) {
              valid = false;
              break;
            }
          }
          if (valid) {
            validSolutions.push(solution);
          }
        }
        if (validSolutions.length > 0) {
          for (let i = 0; i < n; i++) {
            const firstValue = validSolutions[0][i];
            const allSame = validSolutions.every((sol) => sol[i] === firstValue);
            if (allSame) {
              const key = unknownsList[i];
              const [x, y] = key.split(",").map(Number);
              if (firstValue === 1) {
                if (this.grid[y][x] === -1) {
                  this.grid[y][x] = 9;
                  newBombs.push({ x, y });
                  changed = true;
                }
              } else {
                if (this.grid[y][x] === -1) {
                  this.grid[y][x] = 0;
                  newClears.push({ x, y });
                  changed = true;
                }
              }
            }
          }
        }
        return { newBombs, newClears, changed };
      }
      // Solve constraints with overlapping unknowns
      solveOverlapConstraint(cell1, cell2, overlap, only1, only2) {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        const overlapSize = overlap.length;
        for (let overlapMines = 0; overlapMines <= Math.min(overlapSize, Math.min(cell1.remainingBombs, cell2.remainingBombs)); overlapMines++) {
          const mines1InOnly1 = cell1.remainingBombs - overlapMines;
          const mines2InOnly2 = cell2.remainingBombs - overlapMines;
          if (mines1InOnly1 >= 0 && mines1InOnly1 <= only1.length && mines2InOnly2 >= 0 && mines2InOnly2 <= only2.length) {
            if (mines1InOnly1 === 0) {
              for (const pos of only1) {
                if (this.grid[pos.y][pos.x] === -1) {
                  this.grid[pos.y][pos.x] = 0;
                  newClears.push(pos);
                  changed = true;
                }
              }
            } else if (mines1InOnly1 === only1.length) {
              for (const pos of only1) {
                if (this.grid[pos.y][pos.x] === -1) {
                  this.grid[pos.y][pos.x] = 9;
                  newBombs.push(pos);
                  changed = true;
                }
              }
            }
            if (mines2InOnly2 === 0) {
              for (const pos of only2) {
                if (this.grid[pos.y][pos.x] === -1) {
                  this.grid[pos.y][pos.x] = 0;
                  newClears.push(pos);
                  changed = true;
                }
              }
            } else if (mines2InOnly2 === only2.length) {
              for (const pos of only2) {
                if (this.grid[pos.y][pos.x] === -1) {
                  this.grid[pos.y][pos.x] = 9;
                  newBombs.push(pos);
                  changed = true;
                }
              }
            }
          }
        }
        const validOverlapCombinations = [];
        for (let overlapMines = 0; overlapMines <= Math.min(overlapSize, Math.min(cell1.remainingBombs, cell2.remainingBombs)); overlapMines++) {
          const mines1InOnly1 = cell1.remainingBombs - overlapMines;
          const mines2InOnly2 = cell2.remainingBombs - overlapMines;
          if (mines1InOnly1 >= 0 && mines1InOnly1 <= only1.length && mines2InOnly2 >= 0 && mines2InOnly2 <= only2.length) {
            validOverlapCombinations.push(overlapMines);
          }
        }
        if (validOverlapCombinations.length === 1) {
          const exactOverlapMines = validOverlapCombinations[0];
          if (exactOverlapMines === 0) {
            for (const pos of overlap) {
              if (this.grid[pos.y][pos.x] === -1) {
                this.grid[pos.y][pos.x] = 0;
                newClears.push(pos);
                changed = true;
              }
            }
          } else if (exactOverlapMines === overlap.length) {
            for (const pos of overlap) {
              if (this.grid[pos.y][pos.x] === -1) {
                this.grid[pos.y][pos.x] = 9;
                newBombs.push(pos);
                changed = true;
              }
            }
          }
        }
        return { newBombs, newClears, changed };
      }
      // NEW: Analyze overlapping constraints for common patterns
      analyzeOverlappingConstraints(constraintCells) {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        for (let i = 0; i < constraintCells.length; i++) {
          const cell1 = constraintCells[i];
          for (let j = i + 1; j < constraintCells.length; j++) {
            const cell2 = constraintCells[j];
            const unknowns1Set = new Set(cell1.unknowns.map((p) => `${p.x},${p.y}`));
            const unknowns2Set = new Set(cell2.unknowns.map((p) => `${p.x},${p.y}`));
            const overlap = cell1.unknowns.filter((p) => unknowns2Set.has(`${p.x},${p.y}`));
            const only1 = cell1.unknowns.filter((p) => !unknowns2Set.has(`${p.x},${p.y}`));
            const only2 = cell2.unknowns.filter((p) => !unknowns1Set.has(`${p.x},${p.y}`));
            if (overlap.length > 0) {
              const result = this.solveOverlapConstraint(cell1, cell2, overlap, only1, only2);
              if (result.changed) {
                newBombs.push(...result.newBombs);
                newClears.push(...result.newClears);
                changed = true;
              }
            }
          }
        }
        return { newBombs, newClears, changed };
      }
      // NEW: Advanced constraint satisfaction using equation solving
      applyConstraintSatisfaction() {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        const constraintCells = this.getConstraintCells();
        if (constraintCells.length === 0) return { newBombs, newClears, changed };
        const overlapResult = this.analyzeOverlappingConstraints(constraintCells);
        if (overlapResult.changed) {
          newBombs.push(...overlapResult.newBombs);
          newClears.push(...overlapResult.newClears);
          changed = true;
        }
        const allUnknowns = /* @__PURE__ */ new Set();
        constraintCells.forEach((cell) => {
          cell.unknowns.forEach((pos) => {
            allUnknowns.add(`${pos.x},${pos.y}`);
          });
        });
        const unknownsList = Array.from(allUnknowns);
        const unknownsMap = /* @__PURE__ */ new Map();
        unknownsList.forEach((key, index) => {
          unknownsMap.set(key, index);
        });
        if (unknownsList.length <= 15) {
          const result = this.solveBruteForce(constraintCells, unknownsList, unknownsMap);
          if (result.changed) {
            newBombs.push(...result.newBombs);
            newClears.push(...result.newClears);
            changed = true;
          }
        }
        return { newBombs, newClears, changed };
      }
      solveConstraintMatrix(constraints) {
        const solutions = /* @__PURE__ */ new Map();
        let changed = true;
        while (changed) {
          changed = false;
          for (const constraint of constraints) {
            const unknownVars = constraint.unknowns.filter((cell) => !solutions.has(cell));
            const knownMines = constraint.unknowns.filter((cell) => solutions.get(cell) === 1).length;
            const remainingMines = constraint.remainingBombs - knownMines;
            if (remainingMines === 0) {
              for (const cell of unknownVars) {
                if (!solutions.has(cell)) {
                  solutions.set(cell, 0);
                  changed = true;
                }
              }
            } else if (remainingMines === unknownVars.length) {
              for (const cell of unknownVars) {
                if (!solutions.has(cell)) {
                  solutions.set(cell, 1);
                  changed = true;
                }
              }
            }
          }
        }
        return solutions;
      }
      // NEW: Tank solver - advanced pattern recognition
      applyTankSolver() {
        const newBombs = [];
        const newClears = [];
        let changed = false;
        const borderCells = /* @__PURE__ */ new Set();
        const constraints = [];
        for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
            const cell = this.grid[y][x];
            if (cell >= 1 && cell <= 8) {
              const { bombs, unknowns } = this.analyzeAdjacent(y, x);
              const remainingBombs = cell - bombs;
              if (unknowns.length > 0 && remainingBombs > 0) {
                unknowns.forEach((pos) => {
                  borderCells.add(`${pos.x},${pos.y}`);
                });
                constraints.push({
                  unknowns: unknowns.map((pos) => `${pos.x},${pos.y}`),
                  remainingBombs
                });
              }
            }
          }
        }
        if (borderCells.size > 0 && borderCells.size <= 20) {
          const result = this.solveConstraintMatrix(constraints);
          for (const [cellKey, value] of result.entries()) {
            const [x, y] = cellKey.split(",").map(Number);
            if (value === 1 && this.grid[y][x] === -1) {
              this.grid[y][x] = 9;
              newBombs.push({ x, y });
              changed = true;
            } else if (value === 0 && this.grid[y][x] === -1) {
              this.grid[y][x] = 0;
              newClears.push({ x, y });
              changed = true;
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
        const maxIterations = 50;
        while (iterations < maxIterations) {
          iterations++;
          let iterationChanged = false;
          const basicResult = this.applyBasicRules();
          allNewBombs.push(...basicResult.newBombs);
          allNewClears.push(...basicResult.newClears);
          iterationChanged = iterationChanged || basicResult.changed;
          const advancedResult = this.applyAdvancedRules();
          allNewBombs.push(...advancedResult.newBombs);
          allNewClears.push(...advancedResult.newClears);
          iterationChanged = iterationChanged || advancedResult.changed;
          const csResult = this.applyConstraintSatisfaction();
          allNewBombs.push(...csResult.newBombs);
          allNewClears.push(...csResult.newClears);
          iterationChanged = iterationChanged || csResult.changed;
          const tankResult = this.applyTankSolver();
          allNewBombs.push(...tankResult.newBombs);
          allNewClears.push(...tankResult.newClears);
          iterationChanged = iterationChanged || tankResult.changed;
          totalChanged = totalChanged || iterationChanged;
          if (!iterationChanged) {
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
      gameObserver.observe(document, {
        subtree: true,
        childList: true,
        attributeFilter: ["class"]
      });
    };
  })(MinesweeperOnline || (MinesweeperOnline = {}));
  MinesweeperOnline.main();
})();
//# sourceMappingURL=minesweeper-online.user.js.map
