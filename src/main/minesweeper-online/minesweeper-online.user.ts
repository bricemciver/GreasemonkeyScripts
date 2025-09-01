namespace MinesweeperOnline {
  type Cell = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  type Grid = Cell[][]

  interface Position {
    x: number // horizontal axis (column)
    y: number // vertical axis (row)
  }

  interface SolverStepResult {
    newBombs: Position[]
    newClears: Position[]
    changed: boolean
  }

  interface SolverResult extends SolverStepResult {
    grid: Grid
  }

  interface ConstraintCell {
    pos: Position
    value: number
    unknowns: Position[]
    remainingBombs: number
  }

  interface ConstraintGroup extends Array<ConstraintCell> {}

  interface Constraint {
    unknowns: string[]
    remainingBombs: number
  }

  class MinesweeperSolver {
    private readonly grid: Grid
    private readonly rows: number
    private readonly cols: number

    constructor(grid: Grid) {
      this.grid = grid.map(row => [...row]) // Deep copy
      this.rows = grid.length
      this.cols = grid[0].length
    }

    /**
     * Get all adjacent positions for a given cell
     * @param y - vertical position (row)
     * @param x - horizontal position (column)
     */
    private getAdjacentPositions(y: number, x: number): Position[] {
      const adjacent: Position[] = []

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue

          const newY = y + dy
          const newX = x + dx

          if (newY >= 0 && newY < this.rows && newX >= 0 && newX < this.cols) {
            adjacent.push({ x: newX, y: newY })
          }
        }
      }

      return adjacent
    }

    /**
     * Count bombs and unknowns in adjacent cells
     * @param y - vertical position (row)
     * @param x - horizontal position (column)
     */
    private analyzeAdjacent(
      y: number,
      x: number,
    ): {
      bombs: number
      unknowns: Position[]
      clears: number
    } {
      const adjacent = this.getAdjacentPositions(y, x)
      let bombs = 0
      let clears = 0
      const unknowns: Position[] = []

      for (const pos of adjacent) {
        const cell = this.grid[pos.y][pos.x]
        if (cell === 9) {
          bombs++
        } else if (cell === -1) {
          unknowns.push(pos)
        } else if (cell >= 0 && cell <= 8) {
          clears++
        }
      }

      return { bombs, unknowns, clears }
    }

    /**
     * Apply basic minesweeper logic rules
     */
    private applyBasicRules(): SolverStepResult {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      // Check each numbered cell - iterate through rows (y) and columns (x)
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const cell = this.grid[y][x]

          // Only process numbered cells (1-8)
          if (cell >= 1 && cell <= 8) {
            const { bombs, unknowns } = this.analyzeAdjacent(y, x)

            // Rule 1: If we've found all bombs, remaining unknowns are clear
            if (bombs === cell && unknowns.length > 0) {
              for (const pos of unknowns) {
                this.grid[pos.y][pos.x] = 0
                newClears.push(pos)
                changed = true
              }
            }

            // Rule 2: If remaining unknowns equal remaining bombs needed, they're all bombs
            else if (bombs + unknowns.length === cell && unknowns.length > 0) {
              for (const pos of unknowns) {
                this.grid[pos.y][pos.x] = 9
                newBombs.push(pos)
                changed = true
              }
            }
          }
        }
      }

      return { newBombs, newClears, changed }
    }

    /**
     * Apply advanced constraint satisfaction techniques
     */
    private applyAdvancedRules(): {
      newBombs: Position[]
      newClears: Position[]
      changed: boolean
    } {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      // Find all numbered cells with unknowns
      const constraintCells = this.getConstraintCells()

      // Look for subset relationships between constraint cells
      for (let i = 0; i < constraintCells.length; i++) {
        for (let j = i + 1; j < constraintCells.length; j++) {
          const result = this.analyzeConstraintPair(constraintCells[i], constraintCells[j])
          if (result.changed) {
            newBombs.push(...result.newBombs)
            newClears.push(...result.newClears)
            changed = true
          }
        }
      }
      return { newBombs, newClears, changed }
    }

    private getConstraintCells(): Array<{
      pos: Position
      value: number
      unknowns: Position[]
      remainingBombs: number
    }> {
      // Find all numbered cells with unknowns
      const constraintCells: Array<{
        pos: Position
        value: number
        unknowns: Position[]
        remainingBombs: number
      }> = []
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const cell = this.grid[y][x]
          if (cell >= 1 && cell <= 8) {
            const { bombs, unknowns } = this.analyzeAdjacent(y, x)
            const remainingBombs = cell - bombs
            if (unknowns.length > 0 && remainingBombs > 0) {
              constraintCells.push({
                pos: { x, y },
                value: cell,
                unknowns,
                remainingBombs,
              })
            }
          }
        }
      }
      return constraintCells
    }

    private analyzeConstraintPair(cell1: ConstraintCell, cell2: ConstraintCell): SolverStepResult {
      const newBombs = []
      const newClears = []
      let changed = false

      const unknowns1Set = new Set(cell1.unknowns.map(p => `${p.x},${p.y}`))
      const unknowns2Set = new Set(cell2.unknowns.map(p => `${p.x},${p.y}`))

      // Case 1: cell1 unknowns are subset of cell2 unknowns
      if (cell1.unknowns.every(p => unknowns2Set.has(`${p.x},${p.y}`))) {
        const difference = cell2.unknowns.filter(p => !unknowns1Set.has(`${p.x},${p.y}`))
        const bombDifference = cell2.remainingBombs - cell1.remainingBombs

        if (bombDifference === 0 && difference.length > 0) {
          // All difference cells are safe
          for (const pos of difference) {
            if (this.grid[pos.y][pos.x] === -1) {
              this.grid[pos.y][pos.x] = 0
              newClears.push(pos)
              changed = true
            }
          }
        } else if (bombDifference === difference.length && difference.length > 0) {
          // All difference cells are mines
          for (const pos of difference) {
            if (this.grid[pos.y][pos.x] === -1) {
              this.grid[pos.y][pos.x] = 9
              newBombs.push(pos)
              changed = true
            }
          }
        }
      }

      // Case 2: cell2 unknowns are subset of cell1 unknowns
      else if (cell2.unknowns.every(p => unknowns1Set.has(`${p.x},${p.y}`))) {
        const difference = cell1.unknowns.filter(p => !unknowns2Set.has(`${p.x},${p.y}`))
        const bombDifference = cell1.remainingBombs - cell2.remainingBombs

        if (bombDifference === 0 && difference.length > 0) {
          // All difference cells are safe
          for (const pos of difference) {
            if (this.grid[pos.y][pos.x] === -1) {
              this.grid[pos.y][pos.x] = 0
              newClears.push(pos)
              changed = true
            }
          }
        } else if (bombDifference === difference.length && difference.length > 0) {
          // All difference cells are mines
          for (const pos of difference) {
            if (this.grid[pos.y][pos.x] === -1) {
              this.grid[pos.y][pos.x] = 9
              newBombs.push(pos)
              changed = true
            }
          }
        }
      }

      return { newBombs, newClears, changed }
    }

    // NEW: Advanced constraint satisfaction using equation solving
    private applyConstraintSatisfaction() {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      const constraintCells = this.getConstraintCells()
      if (constraintCells.length === 0) return { newBombs, newClears, changed }

      // Group connected constraint regions to solve them separately
      const constraintGroups = this.groupConnectedConstraints(constraintCells)

      for (const group of constraintGroups) {
        const allUnknowns = new Set<string>()
        group.forEach(cell => {
          cell.unknowns.forEach(pos => {
            allUnknowns.add(`${pos.x},${pos.y}`)
          })
        })

        const unknownsList = Array.from(allUnknowns)
        const unknownsMap = new Map()
        unknownsList.forEach((key, index) => {
          unknownsMap.set(key, index)
        })

        // Try all possible combinations for small constraint sets
        if (unknownsList.length <= 16 && group.length <= 10) {
          // Limit for performance
          const result = this.solveBruteForce(group, unknownsList, unknownsMap)
          if (result.changed) {
            newBombs.push(...result.newBombs)
            newClears.push(...result.newClears)
            changed = true
          }
        }
      }

      return { newBombs, newClears, changed }
    }

    // Group constraints that share unknowns into connected components
    private groupConnectedConstraints(constraintCells: ConstraintCell[]): ConstraintGroup[] {
      const groups: ConstraintGroup[] = []
      const visited = new Set<number>()

      for (let i = 0; i < constraintCells.length; i++) {
        if (visited.has(i)) continue

        const group: ConstraintGroup = []
        const queue: number[] = [i]
        visited.add(i)

        while (queue.length > 0) {
          const current = queue.shift() as number
          group.push(constraintCells[current])

          const currentUnknowns = new Set<string>(constraintCells[current].unknowns.map(p => `${p.x},${p.y}`))

          // Find all other constraints that share unknowns with this one
          for (let j = 0; j < constraintCells.length; j++) {
            if (visited.has(j)) continue

            const otherUnknowns = constraintCells[j].unknowns.map(p => `${p.x},${p.y}`)
            const hasSharedUnknown = otherUnknowns.some(unknown => currentUnknowns.has(unknown))

            if (hasSharedUnknown) {
              queue.push(j)
              visited.add(j)
            }
          }
        }

        if (group.length > 0) {
          groups.push(group)
        }
      }

      return groups
    }

    private solveBruteForce(constraintCells: ConstraintCell[], unknownsList: string[], unknownsMap: Map<string, number>): SolverStepResult {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      const n = unknownsList.length
      if (n > 20) return { newBombs, newClears, changed } // Safety limit

      const validSolutions: number[][] = []
      const maxSolutions = 10000 // Limit to prevent infinite computation

      // Generate all possible mine configurations
      for (let mask = 0; mask < 1 << n && validSolutions.length < maxSolutions; mask++) {
        const solution: number[] = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) {
            solution[i] = 1 // mine
          }
        }

        // Check if this solution satisfies all constraints
        let valid = true
        for (const constraint of constraintCells) {
          let mineCount = 0
          for (const pos of constraint.unknowns) {
            const key = `${pos.x},${pos.y}`
            const index = unknownsMap.get(key)
            if (index !== undefined && solution[index] === 1) {
              mineCount++
            }
          }
          if (mineCount !== constraint.remainingBombs) {
            valid = false
            break
          }
        }

        if (valid) {
          validSolutions.push(solution)
        }
      }

      // Find cells that have the same value in ALL valid solutions
      if (validSolutions.length > 0) {
        for (let i = 0; i < n; i++) {
          const firstValue = validSolutions[0][i]
          const allSame = validSolutions.every(sol => sol[i] === firstValue)

          if (allSame) {
            const key = unknownsList[i]
            const [x, y] = key.split(',').map(Number)

            if (firstValue === 1) {
              // All solutions have mine here
              if (this.grid[y][x] === -1) {
                this.grid[y][x] = 9
                newBombs.push({ x, y })
                changed = true
              }
            } else {
              // All solutions have safe cell here
              if (this.grid[y][x] === -1) {
                this.grid[y][x] = 0
                newClears.push({ x, y })
                changed = true
              }
            }
          }
        }
      }

      return { newBombs, newClears, changed }
    }

    // NEW: Tank solver - advanced pattern recognition
    private applyTankSolver() {
      const newBombs = []
      const newClears = []
      let changed = false

      // Find border cells (unknowns adjacent to revealed numbers)
      const borderCells = new Set<string>()
      const constraints = []

      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const cell = this.grid[y][x]
          if (cell >= 1 && cell <= 8) {
            const { bombs, unknowns } = this.analyzeAdjacent(y, x)
            const remainingBombs = cell - bombs

            if (unknowns.length > 0 && remainingBombs > 0) {
              unknowns.forEach(pos => {
                borderCells.add(`${pos.x},${pos.y}`)
              })
              constraints.push({
                unknowns: unknowns.map(pos => `${pos.x},${pos.y}`),
                remainingBombs,
              })
            }
          }
        }
      }

      // Use Gaussian elimination on constraint matrix
      if (borderCells.size > 0 && borderCells.size <= 20) {
        const result = this.solveConstraintMatrix(constraints)

        for (const [cellKey, value] of result.entries()) {
          const [x, y] = cellKey.split(',').map(Number)
          if (value === 1 && this.grid[y][x] === -1) {
            this.grid[y][x] = 9
            newBombs.push({ x, y })
            changed = true
          } else if (value === 0 && this.grid[y][x] === -1) {
            this.grid[y][x] = 0
            newClears.push({ x, y })
            changed = true
          }
        }
      }

      return { newBombs, newClears, changed }
    }

    private solveConstraintMatrix(constraints: Constraint[]): Map<string, 0 | 1> {
      const solutions = new Map<string, 0 | 1>()

      // Simple constraint propagation
      let changed = true
      while (changed) {
        changed = false

        for (const constraint of constraints) {
          const unknownVars = constraint.unknowns.filter(cell => !solutions.has(cell))
          const knownMines = constraint.unknowns.filter(cell => solutions.get(cell) === 1).length
          const remainingMines = constraint.remainingBombs - knownMines

          if (remainingMines === 0) {
            // All remaining unknowns are safe
            for (const cell of unknownVars) {
              if (!solutions.has(cell)) {
                solutions.set(cell, 0)
                changed = true
              }
            }
          } else if (remainingMines === unknownVars.length) {
            // All remaining unknowns are mines
            for (const cell of unknownVars) {
              if (!solutions.has(cell)) {
                solutions.set(cell, 1)
                changed = true
              }
            }
          }
        }
      }

      return solutions
    }

    /**
     * Solve the minesweeper grid using logical deduction
     */
    solve(): SolverResult {
      const allNewBombs: Position[] = []
      const allNewClears: Position[] = []
      let totalChanged = false

      // Keep applying rules until no more changes occur
      let iterations = 0
      const maxIterations = 50 // Prevent infinite loops

      while (iterations < maxIterations) {
        iterations++
        let iterationChanged = false

        // Apply basic rules
        const basicResult = this.applyBasicRules()
        allNewBombs.push(...basicResult.newBombs)
        allNewClears.push(...basicResult.newClears)
        iterationChanged = iterationChanged || basicResult.changed

        // Apply advanced subset rules
        const advancedResult = this.applyAdvancedRules()
        allNewBombs.push(...advancedResult.newBombs)
        allNewClears.push(...advancedResult.newClears)
        iterationChanged = iterationChanged || advancedResult.changed

        // Apply constraint satisfaction
        const csResult = this.applyConstraintSatisfaction()
        allNewBombs.push(...csResult.newBombs)
        allNewClears.push(...csResult.newClears)
        iterationChanged = iterationChanged || csResult.changed

        // Apply tank solver
        const tankResult = this.applyTankSolver()
        allNewBombs.push(...tankResult.newBombs)
        allNewClears.push(...tankResult.newClears)
        iterationChanged = iterationChanged || tankResult.changed

        totalChanged = totalChanged || iterationChanged

        if (!iterationChanged) {
          break
        }
      }

      return {
        grid: this.grid,
        newBombs: allNewBombs,
        newClears: allNewClears,
        changed: totalChanged,
      }
    }
  }

  const classToValue: Record<string, Cell> = {
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
  }

  /**
   * Extracts the cell's position and value from a DOM element.
   * @param element - The cell DOM element
   * @returns Position and value, or null if not found
   */
  const processChange = (element: Element): { x: number; y: number; value: Cell } | null => {
    const xString = element.getAttribute('data-x')
    const yString = element.getAttribute('data-y')
    let value: Cell = -1
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
  function getCellElement(pos: Position): HTMLElement | null {
    return document.getElementById(`cell_${pos.x}_${pos.y}`)
  }

  /**
   * Checks if a cell is still closed (not revealed).
   * @param cell - The cell DOM element
   */
  function isCellClosed(cell: HTMLElement): boolean {
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
  function createHighlightDiv(pos: Position, color: string): HTMLDivElement | null {
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
  function createOverlayFragment(knownMines: Position[], knownSafe: Position[]): DocumentFragment {
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
  function updateOverlay(knownMines: Position[], knownSafe: Position[]): void {
    removeOverlay()
    const board = document.getElementById('game')
    if (!board) return
    const gameBoard = board as HTMLDivElement
    const overlay = document.createElement('div')
    overlay.id = OVERLAY_ID
    overlay.style.position = 'absolute'
    overlay.style.left = `${gameBoard.offsetLeft}px`
    overlay.style.top = `${gameBoard.offsetTop}px`
    overlay.style.width = `${gameBoard.offsetWidth}px`
    overlay.style.height = `${gameBoard.offsetHeight}px`
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '9999'
    overlay.appendChild(createOverlayFragment(knownMines, knownSafe))
    board.appendChild(overlay)
  }

  /**
   * Removes the overlay from the game board if present.
   */
  function removeOverlay(): void {
    const old = document.getElementById(OVERLAY_ID)
    if (old?.parentElement) old.parentElement.removeChild(old)
  }

  /**
   * Creates a 2D grid representing the current state of the board from the DOM.
   */
  function createGrid(): Cell[][] {
    const grid: Cell[][] = []
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
    const solver = new MinesweeperSolver(grid)
    const result = solver.solve()
    const knownMines = result.newBombs
    const knownSafe = result.newClears
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
MinesweeperOnline.main()
