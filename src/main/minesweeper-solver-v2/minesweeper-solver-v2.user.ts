namespace MinesweeperSolver {
  //type Cell = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  type Cell = [number, number] // [row, col]
  type Board = number[][]

  interface Rule {
    numMines: number
    cells: Set<string> // stringified cell coordinates
  }

  class InconsistencyError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'InconsistencyError'
    }
  }

  class Solver {
    private board: Board

    constructor(board: Board) {
      this.board = board
    }

    public static cellToString = (cell: Cell): string => {
      return `${cell[0]},${cell[1]}`
    }

    public static stringToCell = (str: string): Cell => {
      const [r, c] = str.split(',').map(Number)
      return [r, c]
    }

    private createRule = (numMines: number, cells: Cell[]): Rule => {
      return {
        numMines,
        cells: new Set(cells.map(Solver.cellToString)),
      }
    }

    private isRuleTrivial = (rule: Rule): boolean => {
      return rule.numMines === 0 || rule.numMines === rule.cells.size
    }

    private getDefiniteCells = (rule: Rule): { mines: Set<string>; safe: Set<string> } => {
      if (rule.numMines === 0) {
        return { mines: new Set(), safe: new Set(rule.cells) }
      } else if (rule.numMines === rule.cells.size) {
        return { mines: new Set(rule.cells), safe: new Set() }
      } else {
        return { mines: new Set(), safe: new Set() }
      }
    }

    private subtractRule = (superRule: Rule, subRule: Rule): Rule | null => {
      // Check if subRule is subset of superRule
      for (const cell of subRule.cells) {
        if (!superRule.cells.has(cell)) {
          return null
        }
      }

      const remainingCells = new Set(superRule.cells)
      for (const cell of subRule.cells) {
        remainingCells.delete(cell)
      }

      return {
        numMines: superRule.numMines - subRule.numMines,
        cells: remainingCells,
      }
    }

    private getNeighbors = (row: number, col: number, maxRow: number, maxCol: number): Cell[] => {
      const neighbors: Cell[] = []

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue

          const newRow = row + dr
          const newCol = col + dc

          if (newRow >= 0 && newRow < maxRow && newCol >= 0 && newCol < maxCol) {
            neighbors.push([newRow, newCol])
          }
        }
      }

      return neighbors
    }

    private boardToRules(board: Board): Rule[] {
      const rows = board.length
      const cols = board[0].length
      const rules: Rule[] = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellValue = board[r][c]

          // Skip if not a numbered cell (0-8)
          if (cellValue < 0 || cellValue > 8) {
            continue
          }

          const neighbors = this.getNeighbors(r, c, rows, cols)
          const unknownNeighbors: Cell[] = []
          let knownMines = 0

          // Categorize neighbors
          for (const [nr, nc] of neighbors) {
            const neighborValue = board[nr][nc]
            if (neighborValue === -1) {
              // Unknown cell
              unknownNeighbors.push([nr, nc])
            } else if (neighborValue === 9) {
              // Known mine
              knownMines++
            }
          }
          // Cells with values 0-8 are revealed and don't contribute to the constraint

          // Create rule if there are unknown neighbors
          if (unknownNeighbors.length > 0) {
            const remainingMines = cellValue - knownMines

            // Validate the rule
            if (remainingMines < 0) {
              throw new InconsistencyError(`Invalid board state at (${r},${c}): more known mines than indicated`)
            }
            if (remainingMines > unknownNeighbors.length) {
              throw new InconsistencyError(`Invalid board state at (${r},${c}): not enough cells for required mines`)
            }
            rules.push(this.createRule(remainingMines, unknownNeighbors))
          }
        }
      }
      return rules
    }

    private solveDefinite = (rules: Rule[]): { mines: Set<string>; safe: Set<string> } => {
      const ruleSet = new Set(rules)
      const definiteMines = new Set<string>()
      const definiteSafe = new Set<string>()

      let changed = true
      while (changed) {
        changed = false

        // Find trivial rules
        const trivialRules: Rule[] = []
        for (const rule of ruleSet) {
          if (this.isRuleTrivial(rule)) {
            const { mines, safe } = this.getDefiniteCells(rule)
            for (const mine of mines) definiteMines.add(mine)
            for (const safeCell of safe) definiteSafe.add(safeCell)
            trivialRules.push(rule)
            changed = true
          }
        }

        // Remove processed trivial rules
        for (const rule of trivialRules) {
          ruleSet.delete(rule)
        }

        // Try to reduce remaining rules by subtracting trivial ones
        for (const trivialRule of trivialRules) {
          const rulesToReplace: { old: Rule; new: Rule }[] = []

          for (const rule of ruleSet) {
            const reduced = this.subtractRule(rule, trivialRule)
            if (reduced !== null) {
              // Validate the reduction
              if (reduced.numMines < 0 || reduced.numMines > reduced.cells.size) {
                throw new InconsistencyError('Invalid rule after reduction')
              }

              rulesToReplace.push({ old: rule, new: reduced })
              changed = true
            }
          }

          // Apply replacements
          for (const { old, new: newRule } of rulesToReplace) {
            ruleSet.delete(old)
            ruleSet.add(newRule)
          }
        }

        // Try subset reduction
        const rulesArray = Array.from(ruleSet)
        let foundSubsetReduction = false

        for (let i = 0; i < rulesArray.length && !foundSubsetReduction; i++) {
          for (let j = i + 1; j < rulesArray.length && !foundSubsetReduction; j++) {
            const rule1 = rulesArray[i]
            const rule2 = rulesArray[j]

            // Check if rule1 is subset of rule2
            const rule1IsSubset = Array.from(rule1.cells).every(cell => rule2.cells.has(cell))
            if (rule1IsSubset && rule1.cells.size < rule2.cells.size) {
              const reduced = this.subtractRule(rule2, rule1)
              if (reduced !== null && reduced.numMines >= 0) {
                ruleSet.delete(rule2)
                ruleSet.add(reduced)
                changed = true
                foundSubsetReduction = true
              }
            }

            // Check if rule2 is subset of rule1
            const rule2IsSubset = Array.from(rule2.cells).every(cell => rule1.cells.has(cell))
            if (rule2IsSubset && rule2.cells.size < rule1.cells.size) {
              const reduced = this.subtractRule(rule1, rule2)
              if (reduced !== null && reduced.numMines >= 0) {
                ruleSet.delete(rule1)
                ruleSet.add(reduced)
                changed = true
                foundSubsetReduction = true
              }
            }
          }
        }
      }

      return { mines: definiteMines, safe: definiteSafe }
    }

    public solve(): { mines: Set<string>; safe: Set<string> } {
      const rules = this.boardToRules(this.board)
      const { mines, safe } = this.solveDefinite(rules)
      return { mines, safe }
    }
  }

  const classToValue: Record<string, number> = {
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
    nnhdd_type8: 8,
  }

  /**
   * Extracts the cell's position and value from a DOM element.
   * @param element - The cell DOM element
   * @returns Position and value, or null if not found
   */
  const processChange = (element: Element): { x: number; y: number; value: number } | null => {
    const xString = element.getAttribute('data-x')
    const yString = element.getAttribute('data-y')
    let value: number = -1
    for (const [cls, val] of Object.entries(classToValue)) {
      if (element.classList.contains(cls)) {
        value = val
        break
      }
    }
    if (xString && yString) {
      const x = parseInt(xString, 10)
      const y = parseInt(yString, 10)
      return { x, y, value }
    }
    return null
  }

  /**
   * Returns the DOM element for a cell at a given position.
   * @param pos - The cell position
   */
  const getCellElement = (pos: string): HTMLElement | null => {
    const cell: Cell = Solver.stringToCell(pos)
    return document.getElementById(`cell_${cell[1]}_${cell[0]}`)
  }

  /**
   * Checks if a cell is still closed (not revealed).
   * @param cell - The cell DOM element
   */
  const isCellClosed = (cell: HTMLElement): boolean => {
    return cell.classList.contains('hdd_closed')
  }

  let detectionTimeout: number | undefined
  const DEBOUNCE_MS = 500

  const OVERLAY_ID = 'minesweeper-solver-overlay'

  /**
   * Creates a highlight div for a cell overlay.
   * @param pos - The cell position
   * @param color - Border color
   */
  const createHighlightDiv = (pos: string, color: string): HTMLDivElement | null => {
    const cell = getCellElement(pos)
    if (!cell) return null
    if (!isCellClosed(cell)) return null
    const highlight = document.createElement('div')
    highlight.style.position = 'absolute'
    highlight.style.left = `${cell.offsetLeft}px`
    highlight.style.top = `${cell.offsetTop}px`
    highlight.style.width = `${cell.offsetWidth}px`
    highlight.style.height = `${cell.offsetHeight}px`
    highlight.style.pointerEvents = 'none'
    highlight.style.boxSizing = 'border-box'
    highlight.style.border = `2px solid ${color}`
    highlight.style.borderRadius = '3px'
    highlight.style.zIndex = '1'
    return highlight
  }

  /**
   * Creates a document fragment containing overlays for known mines and safe cells.
   * @param knownMines - Array of mine positions
   * @param knownSafe - Array of safe positions
   */
  const createOverlayFragment = (knownMines: Set<string>, knownSafe: Set<string>): DocumentFragment => {
    const fragment = document.createDocumentFragment()
    for (const mine of knownMines) {
      const div = createHighlightDiv(mine, 'red')
      if (div) fragment.appendChild(div)
    }
    for (const safe of knownSafe) {
      const div = createHighlightDiv(safe, 'green')
      if (div) fragment.appendChild(div)
    }
    return fragment
  }

  /**
   * Updates the overlay on the game board to show known mines and safe cells.
   * @param knownMines - Array of mine positions
   * @param knownSafe - Array of safe positions
   */
  const updateOverlay = (knownMines: Set<string>, knownSafe: Set<string>): void => {
    removeOverlay()
    const board = document.getElementById('game')
    if (!board) return
    const overlay = document.createElement('div')
    overlay.id = OVERLAY_ID
    overlay.style.pointerEvents = 'none'
    overlay.appendChild(createOverlayFragment(knownMines, knownSafe))
    board.appendChild(overlay)
  }

  /**
   * Removes the overlay from the game board if present.
   */
  const removeOverlay = (): void => {
    const old = document.getElementById(OVERLAY_ID)
    if (old?.parentElement) old.parentElement.removeChild(old)
  }

  /**
   * Creates a 2D grid representing the current state of the board from the DOM.
   */
  const createGrid = (): Board => {
    const grid: Board = []
    const cells = document.querySelectorAll('#AreaBlock .cell')
    for (const cell of cells) {
      const cellData = processChange(cell)
      if (cellData) {
        if (!grid[cellData.y]) {
          grid[cellData.y] = []
        }
        grid[cellData.y][cellData.x] = cellData.value
      }
    }
    return grid
  }

  /**
   * Schedules a solver run and overlay update, debounced to avoid excessive computation.
   */
  function scheduleDetection(): void {
    if (detectionTimeout !== undefined) {
      clearTimeout(detectionTimeout)
    }
    detectionTimeout = window.setTimeout(runSolverAndUpdateOverlay, DEBOUNCE_MS)
  }

  /**
   * Runs the solver and updates the overlay with the results.
   */
  function runSolverAndUpdateOverlay(): void {
    const grid = createGrid()
    const solver = new Solver(grid)
    const result = solver.solve()
    const knownMines = result.mines
    const knownSafe = result.safe
    updateOverlay(knownMines, knownSafe)
    detectionTimeout = undefined
  }

  /**
   * Observes DOM mutations to trigger solver updates when the board changes.
   */
  const gameObserver = new MutationObserver(records => {
    for (const record of records) {
      if (record.attributeName) {
        const element = record.target as Element
        if (element.classList.contains('cell')) {
          scheduleDetection()
        }
      }
    }
  })

  /**
   * Entry point: starts observing the board for changes and triggers the solver.
   */
  export const main = (): void => {
    gameObserver.observe(document, {
      subtree: true,
      childList: true,
      attributeFilter: ['class'],
    })
  }
}
MinesweeperSolver.main()
