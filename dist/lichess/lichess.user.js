// ==UserScript==
// @name Lichess
// @author Brice McIver
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Shows the most common next move based on the current board position
// @license MIT
// @version 0.0.1
// @icon https://www.google.com/s2/favicons?sz=64&domain=lichess.org
// @match https://lichess.org/*
// @grant GM.xmlHttpRequest
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/lichess/lichess.user.ts
  var Lichess;
  ((Lichess2) => {
    class ChessToUCI {
      constructor() {
        this.reset();
      }
      reset() {
        this.board = [
          ["r", "n", "b", "q", "k", "b", "n", "r"],
          // rank 8 (row 0)
          ["p", "p", "p", "p", "p", "p", "p", "p"],
          // rank 7 (row 1)
          [null, null, null, null, null, null, null, null],
          // rank 6 (row 2)
          [null, null, null, null, null, null, null, null],
          // rank 5 (row 3)
          [null, null, null, null, null, null, null, null],
          // rank 4 (row 4)
          [null, null, null, null, null, null, null, null],
          // rank 3 (row 5)
          ["P", "P", "P", "P", "P", "P", "P", "P"],
          // rank 2 (row 6)
          ["R", "N", "B", "Q", "K", "B", "N", "R"]
          // rank 1 (row 7)
        ];
        this.activeColor = "w";
      }
      fileToCol(file) {
        return file.charCodeAt(0) - "a".charCodeAt(0);
      }
      rankToRow(rank) {
        return 8 - parseInt(rank, 10);
      }
      colToFile(col) {
        return String.fromCharCode("a".charCodeAt(0) + col);
      }
      rowToRank(row) {
        return (8 - row).toString();
      }
      squareToPosition(square) {
        return {
          col: this.fileToCol(square[0]),
          row: this.rankToRow(square[1])
        };
      }
      positionToSquare(pos) {
        return this.colToFile(pos.col) + this.rowToRank(pos.row);
      }
      findPieceForMove(pieceType, targetSquare, disambiguator = "", isCapture = false) {
        const piece = this.activeColor === "w" ? pieceType.toUpperCase() : pieceType.toLowerCase();
        const target = this.squareToPosition(targetSquare);
        const candidates = [];
        if (pieceType.toLowerCase() === "p") {
          if (isCapture) {
            const direction = this.activeColor === "w" ? 1 : -1;
            const sourceRow = target.row + direction;
            if (disambiguator) {
              const sourceCol = this.fileToCol(disambiguator);
              if (sourceRow >= 0 && sourceRow < 8 && this.board[sourceRow][sourceCol] === piece) {
                return { row: sourceRow, col: sourceCol };
              }
            }
          } else {
            const direction = this.activeColor === "w" ? 1 : -1;
            let sourceRow = target.row + direction;
            if (sourceRow >= 0 && sourceRow < 8 && this.board[sourceRow][target.col] === piece) {
              return { row: sourceRow, col: target.col };
            }
            sourceRow = target.row + 2 * direction;
            if (sourceRow >= 0 && sourceRow < 8 && this.board[sourceRow][target.col] === piece) {
              return { row: sourceRow, col: target.col };
            }
          }
          return null;
        }
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            if (this.board[row][col] === piece) {
              if (this.canPieceReach(piece, { row, col }, target)) {
                candidates.push({ row, col });
              }
            }
          }
        }
        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];
        if (disambiguator) {
          for (const candidate of candidates) {
            if (disambiguator.length === 1) {
              if (isNaN(parseInt(disambiguator))) {
                if (this.colToFile(candidate.col) === disambiguator) {
                  return candidate;
                }
              } else {
                if (this.rowToRank(candidate.row) === disambiguator) {
                  return candidate;
                }
              }
            } else if (disambiguator.length === 2) {
              if (this.positionToSquare(candidate) === disambiguator) {
                return candidate;
              }
            }
          }
        }
        return candidates[0];
      }
      canPieceReach(piece, from, to) {
        if (!piece) return false;
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        switch (piece.toLowerCase()) {
          case "r":
            return (dx === 0 || dy === 0) && this.isPathClear(from, to);
          case "n":
            return absDx === 2 && absDy === 1 || absDx === 1 && absDy === 2;
          case "b":
            return absDx === absDy && absDx > 0 && this.isPathClear(from, to);
          case "q":
            return (dx === 0 || dy === 0 || absDx === absDy) && this.isPathClear(from, to);
          case "k":
            return absDx <= 1 && absDy <= 1;
          default:
            return false;
        }
      }
      isPathClear(from, to) {
        const dx = Math.sign(to.col - from.col);
        const dy = Math.sign(to.row - from.row);
        let currentRow = from.row + dy;
        let currentCol = from.col + dx;
        while (currentRow !== to.row || currentCol !== to.col) {
          if (this.board[currentRow][currentCol] !== null) {
            return false;
          }
          currentRow += dy;
          currentCol += dx;
        }
        return true;
      }
      algebraicToUci(move) {
        move = move.replace(/[+#]/, "").trim();
        if (move === "O-O" || move === "0-0") {
          const rank = this.activeColor === "w" ? "1" : "8";
          return `e${rank}g${rank}`;
        }
        if (move === "O-O-O" || move === "0-0-0") {
          const rank = this.activeColor === "w" ? "1" : "8";
          return `e${rank}c${rank}`;
        }
        let promotion = "";
        if (move.includes("=")) {
          const parts = move.split("=");
          move = parts[0];
          promotion = parts[1].toLowerCase();
        }
        const isCapture = move.includes("x");
        move = move.replace("x", "");
        let pieceType = "p";
        let moveStr = move;
        if (/^[KQRBN]/.test(move)) {
          pieceType = move[0].toLowerCase();
          moveStr = move.slice(1);
        }
        const targetMatch = moveStr.match(/([a-h][1-8])$/);
        if (!targetMatch) {
          throw new Error(`Invalid move format: ${move}`);
        }
        const targetSquare = targetMatch[1];
        const disambiguator = moveStr.replace(targetSquare, "");
        const fromPos = this.findPieceForMove(pieceType, targetSquare, disambiguator, isCapture);
        if (!fromPos) {
          throw new Error(`Could not find piece for move: ${move}`);
        }
        const fromSquare = this.positionToSquare(fromPos);
        const uciMove = fromSquare + targetSquare + promotion;
        this.makeMove(fromPos, this.squareToPosition(targetSquare), promotion);
        return uciMove;
      }
      makeMove(from, to, promotion = "") {
        const piece = this.board[from.row][from.col];
        if ((piece == null ? void 0 : piece.toLowerCase()) === "k" && Math.abs(to.col - from.col) === 2) {
          if (to.col === 6) {
            this.board[from.row][5] = this.board[from.row][7];
            this.board[from.row][7] = null;
          } else if (to.col === 2) {
            this.board[from.row][3] = this.board[from.row][0];
            this.board[from.row][0] = null;
          }
        }
        this.board[from.row][from.col] = null;
        if (promotion) {
          const promotedPiece = this.activeColor === "w" ? promotion.toUpperCase() : promotion.toLowerCase();
          this.board[to.row][to.col] = promotedPiece;
        } else {
          this.board[to.row][to.col] = piece;
        }
        this.activeColor = this.activeColor === "w" ? "b" : "w";
      }
      convertMovesToUci(moves) {
        this.reset();
        if (!moves.trim()) return [];
        const moveList = moves.split(",").map((m) => m.trim()).filter((m) => m.length > 0);
        const uciMoves = [];
        for (const move of moveList) {
          try {
            const uciMove = this.algebraicToUci(move);
            uciMoves.push(uciMove);
          } catch (error) {
            throw new Error(`Error converting move "${move}": ${error}`);
          }
        }
        return uciMoves;
      }
    }
    const movesToUci = (moves) => {
      const board = new ChessToUCI();
      return board.convertMovesToUci(moves);
    };
    const getMoveList = (theNode) => {
      return Array.from(theNode.getElementsByTagName("kwdb")).map((el) => el.textContent).join(",");
    };
    const lookForMoves = (theNode) => {
      const moves = getMoveList(theNode);
      if (moves) {
        try {
          const uci = movesToUci(moves);
          console.log("UCI:", uci.join(","));
        } catch (error) {
          console.error("Error generating UCI:", error);
        }
      } else {
        console.log("No moves found");
      }
    };
    const queryMasterDB = (db, uci) => {
      const transaction = db.transaction(["chessMoves"]);
      const objectStore = transaction.objectStore("chessMoves");
      const objectStoreRequest = objectStore.get(uci);
      objectStoreRequest.onerror = () => {
        console.log("Error fetching data from DB.");
      };
      objectStoreRequest.onsuccess = (event) => {
        const target = event.target;
        if (target == null ? void 0 : target.result) {
          console.log("Move found in DB:", target.result);
          return target.result;
        } else {
          console.log("Move not found in DB, need to fetch from external source.");
          GM_xmlhttpRequest({
            method: "GET",
            url: `https://explorer.lichess.ovh/masters?play=${encodeURIComponent(uci)}`,
            onload: (response) => {
              if (response.status === 200) {
                const data = JSON.parse(response.responseText);
                console.log("Fetched move data:", data);
                data.uci = uci;
                const transaction2 = db.transaction(["chessMoves"], "readwrite");
                const objectStore2 = transaction2.objectStore("chessMoves");
                const addRequest = objectStore2.add(data);
                addRequest.onsuccess = () => {
                  console.log("Move data stored in DB.");
                  return data;
                };
                addRequest.onerror = (event2) => {
                  console.error("Error storing move data in DB:", event2);
                };
              } else {
                console.error("Error fetching move data:", response.statusText);
              }
            }
          });
        }
      };
    };
    const initDBOpenRequest = (db) => {
      const DBOpenRequest = window.indexedDB.open("chessMoves");
      DBOpenRequest.onerror = (event) => {
        console.log("Error loading database");
      };
      DBOpenRequest.onsuccess = (event) => {
        console.log("Database initialised.");
        db = DBOpenRequest.result;
      };
      DBOpenRequest.onupgradeneeded = (event) => {
        db = event.target.result;
        db.onerror = (_) => {
          console.log("Error loading database.");
        };
        const objectStore = db.createObjectStore("chessMoves", { keyPath: "uci" });
        objectStore.createIndex("white", "white", { unique: false });
        objectStore.createIndex("draws", "draws", { unique: false });
        objectStore.createIndex("black", "black", { unique: false });
        objectStore.createIndex("moves", "moves", { unique: false });
        objectStore.createIndex("topGames", "topGames", { unique: false });
        objectStore.createIndex("opening", "opening", { unique: false });
        console.log("Object store created.");
      };
      return DBOpenRequest;
    };
    Lichess2.main = () => {
      console.log("Lichess user script loaded");
      let db;
      const DBOpenRequest = initDBOpenRequest(db);
      let lookForMovesCallCnt = 0;
      lookForMoves(document.body);
      lookForMovesCallCnt++;
      const observer = new MutationObserver((records, mutObserver) => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            if (node instanceof Element) {
              lookForMoves(node);
              lookForMovesCallCnt++;
              if (lookForMovesCallCnt % 10 === 0) {
                console.log(`lookForMoves called ${lookForMovesCallCnt} times`);
              }
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    };
  })(Lichess || (Lichess = {}));
  Lichess.main();
})();
//# sourceMappingURL=lichess.user.js.map
