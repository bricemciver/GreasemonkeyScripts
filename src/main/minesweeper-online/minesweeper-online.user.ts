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

    private solveBruteForce(constraintCells: ConstraintCell[], unknownsList: string[], unknownsMap: Map<string, number>): SolverStepResult {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      const n = unknownsList.length
      const validSolutions: number[][] = []

      // Generate all possible mine configurations
      for (let mask = 0; mask < 1 << n; mask++) {
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

    // Solve constraints with overlapping unknowns
    solveOverlapConstraint(
      cell1: ConstraintCell,
      cell2: ConstraintCell,
      overlap: Position[],
      only1: Position[],
      only2: Position[],
    ): SolverStepResult {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      // Try all possible mine distributions in the overlap region
      const overlapSize = overlap.length

      for (
        let overlapMines = 0;
        overlapMines <= Math.min(overlapSize, Math.min(cell1.remainingBombs, cell2.remainingBombs));
        overlapMines++
      ) {
        const mines1InOnly1 = cell1.remainingBombs - overlapMines
        const mines2InOnly2 = cell2.remainingBombs - overlapMines

        // Check if this distribution is valid
        if (mines1InOnly1 >= 0 && mines1InOnly1 <= only1.length && mines2InOnly2 >= 0 && mines2InOnly2 <= only2.length) {
          // If there's exactly one way to distribute mines, we can make deductions
          if (mines1InOnly1 === 0) {
            // All cells in only1 must be safe
            for (const pos of only1) {
              if (this.grid[pos.y][pos.x] === -1) {
                this.grid[pos.y][pos.x] = 0
                newClears.push(pos)
                changed = true
              }
            }
          } else if (mines1InOnly1 === only1.length) {
            // All cells in only1 must be mines
            for (const pos of only1) {
              if (this.grid[pos.y][pos.x] === -1) {
                this.grid[pos.y][pos.x] = 9
                newBombs.push(pos)
                changed = true
              }
            }
          }

          if (mines2InOnly2 === 0) {
            // All cells in only2 must be safe
            for (const pos of only2) {
              if (this.grid[pos.y][pos.x] === -1) {
                this.grid[pos.y][pos.x] = 0
                newClears.push(pos)
                changed = true
              }
            }
          } else if (mines2InOnly2 === only2.length) {
            // All cells in only2 must be mines
            for (const pos of only2) {
              if (this.grid[pos.y][pos.x] === -1) {
                this.grid[pos.y][pos.x] = 9
                newBombs.push(pos)
                changed = true
              }
            }
          }
        }
      }

      // Advanced: Check if certain cells in overlap must be mines/safe
      const validOverlapCombinations: number[] = []

      for (
        let overlapMines = 0;
        overlapMines <= Math.min(overlapSize, Math.min(cell1.remainingBombs, cell2.remainingBombs));
        overlapMines++
      ) {
        const mines1InOnly1 = cell1.remainingBombs - overlapMines
        const mines2InOnly2 = cell2.remainingBombs - overlapMines

        if (mines1InOnly1 >= 0 && mines1InOnly1 <= only1.length && mines2InOnly2 >= 0 && mines2InOnly2 <= only2.length) {
          validOverlapCombinations.push(overlapMines)
        }
      }

      // If overlap must have exactly one number of mines, we might be able to deduce more
      if (validOverlapCombinations.length === 1) {
        const exactOverlapMines = validOverlapCombinations[0]

        if (exactOverlapMines === 0) {
          // All overlap cells are safe
          for (const pos of overlap) {
            if (this.grid[pos.y][pos.x] === -1) {
              this.grid[pos.y][pos.x] = 0
              newClears.push(pos)
              changed = true
            }
          }
        } else if (exactOverlapMines === overlap.length) {
          // All overlap cells are mines
          for (const pos of overlap) {
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

    // NEW: Analyze overlapping constraints for common patterns
    analyzeOverlappingConstraints(constraintCells: ConstraintCell[]): SolverStepResult {
      const newBombs: Position[] = []
      const newClears: Position[] = []
      let changed = false

      // Group constraints by their overlapping unknowns
      for (let i = 0; i < constraintCells.length; i++) {
        const cell1 = constraintCells[i]

        for (let j = i + 1; j < constraintCells.length; j++) {
          const cell2 = constraintCells[j]

          // Find overlapping and non-overlapping unknowns
          const unknowns1Set = new Set(cell1.unknowns.map(p => `${p.x},${p.y}`))
          const unknowns2Set = new Set(cell2.unknowns.map(p => `${p.x},${p.y}`))

          const overlap: Position[] = cell1.unknowns.filter(p => unknowns2Set.has(`${p.x},${p.y}`))
          const only1: Position[] = cell1.unknowns.filter(p => !unknowns2Set.has(`${p.x},${p.y}`))
          const only2: Position[] = cell2.unknowns.filter(p => !unknowns1Set.has(`${p.x},${p.y}`))

          if (overlap.length > 0) {
            // Analyze the constraint interaction
            const result: SolverStepResult = this.solveOverlapConstraint(cell1, cell2, overlap, only1, only2)
            if (result.changed) {
              newBombs.push(...result.newBombs)
              newClears.push(...result.newClears)
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

      // First try overlapping constraint analysis (faster for common patterns)
      const overlapResult = this.analyzeOverlappingConstraints(constraintCells)
      if (overlapResult.changed) {
        newBombs.push(...overlapResult.newBombs)
        newClears.push(...overlapResult.newClears)
        changed = true
      }

      // Build system of linear constraints
      const allUnknowns = new Set<string>()
      constraintCells.forEach(cell => {
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
      if (unknownsList.length <= 15) {
        // Limit for performance
        const result = this.solveBruteForce(constraintCells, unknownsList, unknownsMap)
        if (result.changed) {
          newBombs.push(...result.newBombs)
          newClears.push(...result.newClears)
          changed = true
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

  const processChange = (element: Element) => {
    // example data
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

  let detectionTimeout: number | undefined
  const DEBOUNCE_MS = 500

  const OVERLAY_ID = 'minesweeper-solver-overlay'

  function createOverlayFragment(knownMines: Position[], knownSafe: Position[]) {
    const fragment = document.createDocumentFragment()

    // Helper to create a highlight div for a cell
    function createHighlightDiv(pos: Position, color: string) {
      const cell = document.getElementById(`cell_${pos.x}_${pos.y}`)
      if (!cell) return null

      // Make sure it hasn't be revealed already
      if (!cell.classList.contains('hdd_closed')) {
        return null
      }

      // Position relative to the board container
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

  function updateOverlay(knownMines: Position[], knownSafe: Position[]) {
    // Remove old overlay if present
    const old = document.getElementById(OVERLAY_ID)
    if (old?.parentElement) old.parentElement.removeChild(old)

    // Find the board container (adjust selector as needed)
    const board = document.getElementById('game')
    if (!board) return
    const gameBoard = board as HTMLDivElement

    // Create overlay container
    const overlay = document.createElement('div')
    overlay.id = OVERLAY_ID
    overlay.style.position = 'absolute'
    overlay.style.left = '0'
    overlay.style.top = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '9999'

    // Position overlay absolutely over the board
    overlay.style.left = `${gameBoard.offsetLeft}px`
    overlay.style.top = `${gameBoard.offsetTop}px`
    overlay.style.width = `${gameBoard.offsetWidth}px`
    overlay.style.height = `${gameBoard.offsetHeight}px`

    // Add highlights
    overlay.appendChild(createOverlayFragment(knownMines, knownSafe))

    // Insert overlay into board container
    board.appendChild(overlay)
  }

  const createGrid = () => {
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

  const scheduleDetection = () => {
    if (detectionTimeout !== undefined) {
      clearTimeout(detectionTimeout)
    }
    detectionTimeout = window.setTimeout(() => {
      const grid = createGrid()
      const solver = new MinesweeperSolver(grid)
      const result = solver.solve()
      const knownMines = result.newBombs
      const knownSafe = result.newClears
      updateOverlay(knownMines, knownSafe)
      detectionTimeout = undefined
    }, DEBOUNCE_MS)
  }

  const gameObserver = new MutationObserver(records => {
    for (const record of records) {
      if (record.attributeName) {
        // target is the element so type it
        const element = record.target as Element
        if (element.classList.contains('cell')) {
          scheduleDetection()
        }
      }
    }
  })

  export const main = () => {
    gameObserver.observe(document, {
      subtree: true,
      childList: true,
      attributeFilter: ['class'],
    })
  }
}
MinesweeperOnline.main()
