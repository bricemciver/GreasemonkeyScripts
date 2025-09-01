namespace OctordleMildCheat {
  enum State {
    correct,
    diff,
    none,
  }

  type ProcessedCell = {
    letter: string
    position: number
    status: State
  }

  const wordBankRegEx = /"([^"]*\bsonic\b[^"]*)"/
  const allowedRegEx = /"([^"]*\bcorky\b[^"]*)"/
  const wordBankWords: string[] = []
  const allowedWords: string[] = []

  /**
   * Set an item into storage
   * @param key key to set
   * @param value value to set
   */
  const setItem = (key: string, value: any) => {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  }

  /**
   * Get an item from session storage
   * @param key key to get
   * @param defaultVal value to return if key doesn't exist
   */
  const getItem = (key: string, defaultVal: any) => {
    const val = window.sessionStorage.getItem(key)
    if (!val || val === 'undefined') return defaultVal
    try {
      return JSON.parse(val)
    } catch (_e) {
      return val
    }
  }

  const callback: MutationCallback = (mutationList, mutationObserver) => {
    for (const mutation of mutationList) {
      if (
        mutation.addedNodes.length > 0 &&
        mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE &&
        mutation.addedNodes[0].nodeName === 'SCRIPT'
      ) {
        const element = mutation.addedNodes[0] as HTMLScriptElement
        if (element.type === 'module') {
          // Get the script
          GM.xmlHttpRequest({
            method: 'GET',
            url: element.src,
            onload(response) {
              const text = response.responseText
              // get wordBank words
              const wordBankMatches = RegExp(wordBankRegEx).exec(text)
              if (wordBankMatches && wordBankMatches.length > 1) {
                wordBankWords.push(...wordBankMatches[1].split(' ').map(word => word.toUpperCase()))
              }
              // get allowed words
              const allowedMatches = RegExp(allowedRegEx).exec(text)
              if (allowedMatches && allowedMatches.length > 1) {
                allowedWords.push(...allowedMatches[1].split(' ').map(word => word.toUpperCase()))
              }
              // store in session so we don't retrieve every time
              setItem('wordBank', wordBankWords)
              setItem('allowed', allowedWords)
            },
          })
          mutationObserver.disconnect()
          break
        }
      }
    }
  }

  export const findAllowedWords = () => {
    // see if we need to retrieve
    wordBankWords.push(...getItem('wordBank', []))
    allowedWords.push(...getItem('allowed', []))
    if (!wordBankWords.length || !allowedWords.length) {
      // create a new instance of `MutationObserver` named `observer`,
      // passing it a callback function
      const observer = new MutationObserver(callback)

      // call `observe()` on that MutationObserver instance,
      // passing it the element to observe, and the options object
      observer.observe(document, { subtree: true, childList: true })
    }
  }

  const createWordlistDialog = () => {
    const wordlist = document.createElement('dialog')
    wordlist.classList.add('dialog')
    wordlist.id = 'dialog'
    const header = document.createElement('h2')
    header.textContent = 'Word List'
    wordlist.appendChild(header)
    const listContainer = document.createElement('div')
    listContainer.id = 'wordList'
    wordlist.appendChild(listContainer)
    return wordlist
  }

  const createBoardList = (wordList: HTMLElement, board: string[], title: string) => {
    const boardHeader = document.createElement('h2')
    boardHeader.textContent = title
    wordList.appendChild(boardHeader)
    const list = document.createElement('ul')
    for (const word of board) {
      const listItem = document.createElement('li')
      listItem.textContent = word
      if (wordBankWords.some(item => item === word)) {
        listItem.attributeStyleMap.set('font-weight', 700)
      }
      list.appendChild(listItem)
    }
    wordList.appendChild(list)
  }

  const showWordlist = (...boards: string[][]) => {
    let wordList = document.getElementById('wordList')
    if (!wordList) {
      // load new styles
      const head = document.getElementsByTagName('head')[0]
      const style = document.createElement('style')
      head.appendChild(style)
      style.setAttribute('type', 'text/css')
      if (style.sheet) {
        style.sheet.insertRule(`.dialog li {
            display: block;
            padding: 2px 0px;
        }`)
        style.sheet.insertRule(`.dialog ul {
            list-style: none;
            margin: 4px 0px;
            position: relative;
            padding: 0px;
        }`)
        style.sheet.insertRule(`.dialog h2 {
            font-size: 0.6875rem;
            line-height: 1.5;
            letter-spacing: 0.08rem;
            font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            font-weight: 700;
            display: flex;
            align-items: center;
            border-radius: 5px;
            outline: 0px;
            width: 100%;
            justify-content: flex-start;
            transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            text-decoration: none;
            color: rgb(111, 126, 140);
            margin-top: 8px;
            text-transform: uppercase;
        }`)
        style.sheet.insertRule(`.dialog {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            padding: 20px;
            background-color: #f2f2f2;
            border: 1px solid #ccc;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0 auto;
        }`)
      }

      // create wordlist div
      const helpDiv = createWordlistDialog()

      // attach to body
      document.body.appendChild(helpDiv)
      wordList = document.getElementById('wordList')
    }

    if (wordList) {
      wordList.innerHTML = ''
    }

    // add boards
    boards.forEach((board, index) => {
      if (wordList) {
        createBoardList(wordList, board, `Board ${index + 1}`)
      }
    })

    const dialog = document.querySelector<HTMLDialogElement>('dialog#dialog')
    if (dialog) {
      dialog.showModal()
    }
  }

  const hideWordlist = () => {
    const dialog = document.querySelector<HTMLDialogElement>('dialog#dialog')
    if (dialog) {
      dialog.close()
    }
  }

  const processCell = (pos: number, element: HTMLDivElement): ProcessedCell | null => {
    const letter = element.children[0].textContent ?? ''
    if (element.classList.contains('exact-match')) {
      // letter is in correct spot
      return {
        letter: letter.trim(),
        position: pos,
        status: State.correct,
      }
    }
    if (element.classList.contains('word-match')) {
      // letter is in word, not in that place
      return {
        letter: letter.trim(),
        position: pos,
        status: State.diff,
      }
    }
    if (letter.length > 0 && letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
      // if we have a letter, it doesn't belong
      return {
        letter: letter.trim(),
        position: pos,
        status: State.none,
      }
    }
    return null
  }

  const extractGameBoard = (boardNum: number) => {
    const boardState: ProcessedCell[] = []
    const board = document.getElementById(`board-${boardNum}`)
    // get rows
    if (board) {
      const rows = board.querySelectorAll<HTMLDivElement>("div[class~='board-row']")
      for (const row of rows) {
        // get all cells in a row
        const cells = row.querySelectorAll<HTMLDivElement>("div[class~='letter']")
        let index = 0
        for (const cell of cells) {
          // get the letter, position, and status
          const processedCell = processCell(index, cell)
          if (processedCell !== null) {
            boardState.push(processedCell)
          }
          index++
        }
      }
    }
    return boardState
  }

  export const addListeners = () => {
    document.addEventListener(
      'keydown',
      event => {
        if (event.defaultPrevented) {
          return // Do nothing if the event was already processed
        }
        if (event.key === '?') {
          event.preventDefault()
          const boardArray = []
          for (let i = 1; i < 9; i++) {
            boardArray.push(processGameBoard(extractGameBoard(i)))
          }
          showWordlist(...boardArray)
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          hideWordlist()
        }
      },
      true,
    )
  }

  const sortProcessedCells = (cells: ProcessedCell[]): ProcessedCell[] => {
    return cells.sort((a, b) => a.status - b.status)
  }

  const processGameBoard = (boardState: ProcessedCell[]) => {
    let tempWordList = [...wordBankWords, ...allowedWords]

    // sort boardState so all correct answers are handled first, then diff, then none
    sortProcessedCells(boardState)

    for (const item of boardState) {
      if (item.status === State.correct) {
        // process all the correct answers first to shrink word list
        tempWordList = tempWordList.filter(word => word.charAt(item.position).toUpperCase() === item.letter.toUpperCase())
      } else if (item.status === State.diff) {
        // now eliminate words where 'diff' items appear in that spot
        // and where 'diff' item doesn't appear at all
        tempWordList = tempWordList.filter(
          word => word.charAt(item.position).toUpperCase() !== item.letter.toUpperCase() && word.indexOf(item.letter.toUpperCase()) !== -1,
        )
      } else if (
        item.status === State.none &&
        !boardState.some(({ letter, status }) => (status === State.correct || status === State.diff) && letter === item.letter)
      ) {
        // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
        tempWordList = tempWordList.filter(word => word.indexOf(item.letter.toUpperCase()) === -1)
      } else if (
        item.status === State.none &&
        boardState.some(({ letter, status }) => (status === State.correct || status === State.diff) && letter === item.letter)
      ) {
        // edge case; remove words with duplicate letters if status is none but other status of diff or correct exists
        // this will not handle words with 3 of the same letter correctly
        tempWordList = tempWordList.filter(word => word.indexOf(item.letter.toUpperCase()) === word.lastIndexOf(item.letter.toUpperCase()))
      }
    }

    return tempWordList
  }
}
// Retrieve (locally or from site) the word lists
OctordleMildCheat.findAllowedWords()
// add listeners
OctordleMildCheat.addListeners()
