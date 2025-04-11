// ==UserScript==
// @name Lichess - Show common move
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
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e2) {
          reject(e2);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/chessops/dist/esm/types.js
  var FILE_NAMES, RANK_NAMES, COLORS, ROLES, CASTLING_SIDES, isDrop;
  var init_types = __esm({
    "node_modules/chessops/dist/esm/types.js"() {
      FILE_NAMES = ["a", "b", "c", "d", "e", "f", "g", "h"];
      RANK_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];
      COLORS = ["white", "black"];
      ROLES = ["pawn", "knight", "bishop", "rook", "queen", "king"];
      CASTLING_SIDES = ["a", "h"];
      isDrop = (v) => "role" in v;
    }
  });

  // node_modules/chessops/dist/esm/util.js
  function charToRole(ch) {
    switch (ch.toLowerCase()) {
      case "p":
        return "pawn";
      case "n":
        return "knight";
      case "b":
        return "bishop";
      case "r":
        return "rook";
      case "q":
        return "queen";
      case "k":
        return "king";
      default:
        return;
    }
  }
  function parseSquare(str) {
    if (str.length !== 2)
      return;
    return squareFromCoords(str.charCodeAt(0) - "a".charCodeAt(0), str.charCodeAt(1) - "1".charCodeAt(0));
  }
  var defined, opposite, squareRank, squareFile, squareFromCoords, roleToChar, makeSquare, kingCastlesTo, rookCastlesTo;
  var init_util = __esm({
    "node_modules/chessops/dist/esm/util.js"() {
      init_types();
      defined = (v) => v !== void 0;
      opposite = (color) => color === "white" ? "black" : "white";
      squareRank = (square) => square >> 3;
      squareFile = (square) => square & 7;
      squareFromCoords = (file, rank) => 0 <= file && file < 8 && 0 <= rank && rank < 8 ? file + 8 * rank : void 0;
      roleToChar = (role) => {
        switch (role) {
          case "pawn":
            return "p";
          case "knight":
            return "n";
          case "bishop":
            return "b";
          case "rook":
            return "r";
          case "queen":
            return "q";
          case "king":
            return "k";
        }
      };
      makeSquare = (square) => FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)];
      kingCastlesTo = (color, side) => color === "white" ? side === "a" ? 2 : 6 : side === "a" ? 58 : 62;
      rookCastlesTo = (color, side) => color === "white" ? side === "a" ? 3 : 5 : side === "a" ? 59 : 61;
    }
  });

  // node_modules/chessops/dist/esm/squareSet.js
  var popcnt32, bswap32, rbit32, SquareSet;
  var init_squareSet = __esm({
    "node_modules/chessops/dist/esm/squareSet.js"() {
      popcnt32 = (n2) => {
        n2 = n2 - (n2 >>> 1 & 1431655765);
        n2 = (n2 & 858993459) + (n2 >>> 2 & 858993459);
        return Math.imul(n2 + (n2 >>> 4) & 252645135, 16843009) >> 24;
      };
      bswap32 = (n2) => {
        n2 = n2 >>> 8 & 16711935 | (n2 & 16711935) << 8;
        return n2 >>> 16 & 65535 | (n2 & 65535) << 16;
      };
      rbit32 = (n2) => {
        n2 = n2 >>> 1 & 1431655765 | (n2 & 1431655765) << 1;
        n2 = n2 >>> 2 & 858993459 | (n2 & 858993459) << 2;
        n2 = n2 >>> 4 & 252645135 | (n2 & 252645135) << 4;
        return bswap32(n2);
      };
      SquareSet = class _SquareSet {
        constructor(lo, hi) {
          this.lo = lo | 0;
          this.hi = hi | 0;
        }
        static fromSquare(square) {
          return square >= 32 ? new _SquareSet(0, 1 << square - 32) : new _SquareSet(1 << square, 0);
        }
        static fromRank(rank) {
          return new _SquareSet(255, 0).shl64(8 * rank);
        }
        static fromFile(file) {
          return new _SquareSet(16843009 << file, 16843009 << file);
        }
        static empty() {
          return new _SquareSet(0, 0);
        }
        static full() {
          return new _SquareSet(4294967295, 4294967295);
        }
        static corners() {
          return new _SquareSet(129, 2164260864);
        }
        static center() {
          return new _SquareSet(402653184, 24);
        }
        static backranks() {
          return new _SquareSet(255, 4278190080);
        }
        static backrank(color) {
          return color === "white" ? new _SquareSet(255, 0) : new _SquareSet(0, 4278190080);
        }
        static lightSquares() {
          return new _SquareSet(1437226410, 1437226410);
        }
        static darkSquares() {
          return new _SquareSet(2857740885, 2857740885);
        }
        complement() {
          return new _SquareSet(~this.lo, ~this.hi);
        }
        xor(other) {
          return new _SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
        }
        union(other) {
          return new _SquareSet(this.lo | other.lo, this.hi | other.hi);
        }
        intersect(other) {
          return new _SquareSet(this.lo & other.lo, this.hi & other.hi);
        }
        diff(other) {
          return new _SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
        }
        intersects(other) {
          return this.intersect(other).nonEmpty();
        }
        isDisjoint(other) {
          return this.intersect(other).isEmpty();
        }
        supersetOf(other) {
          return other.diff(this).isEmpty();
        }
        subsetOf(other) {
          return this.diff(other).isEmpty();
        }
        shr64(shift) {
          if (shift >= 64)
            return _SquareSet.empty();
          if (shift >= 32)
            return new _SquareSet(this.hi >>> shift - 32, 0);
          if (shift > 0)
            return new _SquareSet(this.lo >>> shift ^ this.hi << 32 - shift, this.hi >>> shift);
          return this;
        }
        shl64(shift) {
          if (shift >= 64)
            return _SquareSet.empty();
          if (shift >= 32)
            return new _SquareSet(0, this.lo << shift - 32);
          if (shift > 0)
            return new _SquareSet(this.lo << shift, this.hi << shift ^ this.lo >>> 32 - shift);
          return this;
        }
        bswap64() {
          return new _SquareSet(bswap32(this.hi), bswap32(this.lo));
        }
        rbit64() {
          return new _SquareSet(rbit32(this.hi), rbit32(this.lo));
        }
        minus64(other) {
          const lo = this.lo - other.lo;
          const c = (lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1) >>> 31;
          return new _SquareSet(lo, this.hi - (other.hi + c));
        }
        equals(other) {
          return this.lo === other.lo && this.hi === other.hi;
        }
        size() {
          return popcnt32(this.lo) + popcnt32(this.hi);
        }
        isEmpty() {
          return this.lo === 0 && this.hi === 0;
        }
        nonEmpty() {
          return this.lo !== 0 || this.hi !== 0;
        }
        has(square) {
          return (square >= 32 ? this.hi & 1 << square - 32 : this.lo & 1 << square) !== 0;
        }
        set(square, on) {
          return on ? this.with(square) : this.without(square);
        }
        with(square) {
          return square >= 32 ? new _SquareSet(this.lo, this.hi | 1 << square - 32) : new _SquareSet(this.lo | 1 << square, this.hi);
        }
        without(square) {
          return square >= 32 ? new _SquareSet(this.lo, this.hi & ~(1 << square - 32)) : new _SquareSet(this.lo & ~(1 << square), this.hi);
        }
        toggle(square) {
          return square >= 32 ? new _SquareSet(this.lo, this.hi ^ 1 << square - 32) : new _SquareSet(this.lo ^ 1 << square, this.hi);
        }
        last() {
          if (this.hi !== 0)
            return 63 - Math.clz32(this.hi);
          if (this.lo !== 0)
            return 31 - Math.clz32(this.lo);
          return;
        }
        first() {
          if (this.lo !== 0)
            return 31 - Math.clz32(this.lo & -this.lo);
          if (this.hi !== 0)
            return 63 - Math.clz32(this.hi & -this.hi);
          return;
        }
        withoutFirst() {
          if (this.lo !== 0)
            return new _SquareSet(this.lo & this.lo - 1, this.hi);
          return new _SquareSet(0, this.hi & this.hi - 1);
        }
        moreThanOne() {
          return this.hi !== 0 && this.lo !== 0 || (this.lo & this.lo - 1) !== 0 || (this.hi & this.hi - 1) !== 0;
        }
        singleSquare() {
          return this.moreThanOne() ? void 0 : this.last();
        }
        *[Symbol.iterator]() {
          let lo = this.lo;
          let hi = this.hi;
          while (lo !== 0) {
            const idx = 31 - Math.clz32(lo & -lo);
            lo ^= 1 << idx;
            yield idx;
          }
          while (hi !== 0) {
            const idx = 31 - Math.clz32(hi & -hi);
            hi ^= 1 << idx;
            yield 32 + idx;
          }
        }
        *reversed() {
          let lo = this.lo;
          let hi = this.hi;
          while (hi !== 0) {
            const idx = 31 - Math.clz32(hi);
            hi ^= 1 << idx;
            yield 32 + idx;
          }
          while (lo !== 0) {
            const idx = 31 - Math.clz32(lo);
            lo ^= 1 << idx;
            yield idx;
          }
        }
      };
    }
  });

  // node_modules/chessops/dist/esm/attacks.js
  var computeRange, tabulate, KING_ATTACKS, KNIGHT_ATTACKS, PAWN_ATTACKS, kingAttacks, knightAttacks, pawnAttacks, FILE_RANGE, RANK_RANGE, DIAG_RANGE, ANTI_DIAG_RANGE, hyperbola, fileAttacks, rankAttacks, bishopAttacks, rookAttacks, queenAttacks, attacks, ray, between;
  var init_attacks = __esm({
    "node_modules/chessops/dist/esm/attacks.js"() {
      init_squareSet();
      init_util();
      computeRange = (square, deltas) => {
        let range = SquareSet.empty();
        for (const delta of deltas) {
          const sq = square + delta;
          if (0 <= sq && sq < 64 && Math.abs(squareFile(square) - squareFile(sq)) <= 2) {
            range = range.with(sq);
          }
        }
        return range;
      };
      tabulate = (f) => {
        const table = [];
        for (let square = 0; square < 64; square++)
          table[square] = f(square);
        return table;
      };
      KING_ATTACKS = tabulate((sq) => computeRange(sq, [-9, -8, -7, -1, 1, 7, 8, 9]));
      KNIGHT_ATTACKS = tabulate((sq) => computeRange(sq, [-17, -15, -10, -6, 6, 10, 15, 17]));
      PAWN_ATTACKS = {
        white: tabulate((sq) => computeRange(sq, [7, 9])),
        black: tabulate((sq) => computeRange(sq, [-7, -9]))
      };
      kingAttacks = (square) => KING_ATTACKS[square];
      knightAttacks = (square) => KNIGHT_ATTACKS[square];
      pawnAttacks = (color, square) => PAWN_ATTACKS[color][square];
      FILE_RANGE = tabulate((sq) => SquareSet.fromFile(squareFile(sq)).without(sq));
      RANK_RANGE = tabulate((sq) => SquareSet.fromRank(squareRank(sq)).without(sq));
      DIAG_RANGE = tabulate((sq) => {
        const diag = new SquareSet(134480385, 2151686160);
        const shift = 8 * (squareRank(sq) - squareFile(sq));
        return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
      });
      ANTI_DIAG_RANGE = tabulate((sq) => {
        const diag = new SquareSet(270549120, 16909320);
        const shift = 8 * (squareRank(sq) + squareFile(sq) - 7);
        return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
      });
      hyperbola = (bit, range, occupied) => {
        let forward = occupied.intersect(range);
        let reverse = forward.bswap64();
        forward = forward.minus64(bit);
        reverse = reverse.minus64(bit.bswap64());
        return forward.xor(reverse.bswap64()).intersect(range);
      };
      fileAttacks = (square, occupied) => hyperbola(SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
      rankAttacks = (square, occupied) => {
        const range = RANK_RANGE[square];
        let forward = occupied.intersect(range);
        let reverse = forward.rbit64();
        forward = forward.minus64(SquareSet.fromSquare(square));
        reverse = reverse.minus64(SquareSet.fromSquare(63 - square));
        return forward.xor(reverse.rbit64()).intersect(range);
      };
      bishopAttacks = (square, occupied) => {
        const bit = SquareSet.fromSquare(square);
        return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
      };
      rookAttacks = (square, occupied) => fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
      queenAttacks = (square, occupied) => bishopAttacks(square, occupied).xor(rookAttacks(square, occupied));
      attacks = (piece, square, occupied) => {
        switch (piece.role) {
          case "pawn":
            return pawnAttacks(piece.color, square);
          case "knight":
            return knightAttacks(square);
          case "bishop":
            return bishopAttacks(square, occupied);
          case "rook":
            return rookAttacks(square, occupied);
          case "queen":
            return queenAttacks(square, occupied);
          case "king":
            return kingAttacks(square);
        }
      };
      ray = (a, b) => {
        const other = SquareSet.fromSquare(b);
        if (RANK_RANGE[a].intersects(other))
          return RANK_RANGE[a].with(a);
        if (ANTI_DIAG_RANGE[a].intersects(other))
          return ANTI_DIAG_RANGE[a].with(a);
        if (DIAG_RANGE[a].intersects(other))
          return DIAG_RANGE[a].with(a);
        if (FILE_RANGE[a].intersects(other))
          return FILE_RANGE[a].with(a);
        return SquareSet.empty();
      };
      between = (a, b) => ray(a, b).intersect(SquareSet.full().shl64(a).xor(SquareSet.full().shl64(b))).withoutFirst();
    }
  });

  // node_modules/chessops/dist/esm/board.js
  var Board;
  var init_board = __esm({
    "node_modules/chessops/dist/esm/board.js"() {
      init_squareSet();
      init_types();
      Board = class _Board {
        constructor() {
        }
        static default() {
          const board = new _Board();
          board.reset();
          return board;
        }
        /**
         * Resets all pieces to the default starting position for standard chess.
         */
        reset() {
          this.occupied = new SquareSet(65535, 4294901760);
          this.promoted = SquareSet.empty();
          this.white = new SquareSet(65535, 0);
          this.black = new SquareSet(0, 4294901760);
          this.pawn = new SquareSet(65280, 16711680);
          this.knight = new SquareSet(66, 1107296256);
          this.bishop = new SquareSet(36, 603979776);
          this.rook = new SquareSet(129, 2164260864);
          this.queen = new SquareSet(8, 134217728);
          this.king = new SquareSet(16, 268435456);
        }
        static empty() {
          const board = new _Board();
          board.clear();
          return board;
        }
        clear() {
          this.occupied = SquareSet.empty();
          this.promoted = SquareSet.empty();
          for (const color of COLORS)
            this[color] = SquareSet.empty();
          for (const role of ROLES)
            this[role] = SquareSet.empty();
        }
        clone() {
          const board = new _Board();
          board.occupied = this.occupied;
          board.promoted = this.promoted;
          for (const color of COLORS)
            board[color] = this[color];
          for (const role of ROLES)
            board[role] = this[role];
          return board;
        }
        getColor(square) {
          if (this.white.has(square))
            return "white";
          if (this.black.has(square))
            return "black";
          return;
        }
        getRole(square) {
          for (const role of ROLES) {
            if (this[role].has(square))
              return role;
          }
          return;
        }
        get(square) {
          const color = this.getColor(square);
          if (!color)
            return;
          const role = this.getRole(square);
          const promoted = this.promoted.has(square);
          return { color, role, promoted };
        }
        /**
         * Removes and returns the piece from the given `square`, if any.
         */
        take(square) {
          const piece = this.get(square);
          if (piece) {
            this.occupied = this.occupied.without(square);
            this[piece.color] = this[piece.color].without(square);
            this[piece.role] = this[piece.role].without(square);
            if (piece.promoted)
              this.promoted = this.promoted.without(square);
          }
          return piece;
        }
        /**
         * Put `piece` onto `square`, potentially replacing an existing piece.
         * Returns the existing piece, if any.
         */
        set(square, piece) {
          const old = this.take(square);
          this.occupied = this.occupied.with(square);
          this[piece.color] = this[piece.color].with(square);
          this[piece.role] = this[piece.role].with(square);
          if (piece.promoted)
            this.promoted = this.promoted.with(square);
          return old;
        }
        has(square) {
          return this.occupied.has(square);
        }
        *[Symbol.iterator]() {
          for (const square of this.occupied) {
            yield [square, this.get(square)];
          }
        }
        pieces(color, role) {
          return this[color].intersect(this[role]);
        }
        rooksAndQueens() {
          return this.rook.union(this.queen);
        }
        bishopsAndQueens() {
          return this.bishop.union(this.queen);
        }
        /**
         * Finds the unique king of the given `color`, if any.
         */
        kingOf(color) {
          return this.pieces(color, "king").singleSquare();
        }
      };
    }
  });

  // node_modules/chessops/dist/esm/setup.js
  var MaterialSide, Material, RemainingChecks;
  var init_setup = __esm({
    "node_modules/chessops/dist/esm/setup.js"() {
      init_types();
      MaterialSide = class _MaterialSide {
        constructor() {
        }
        static empty() {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = 0;
          return m;
        }
        static fromBoard(board, color) {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = board.pieces(color, role).size();
          return m;
        }
        clone() {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = this[role];
          return m;
        }
        equals(other) {
          return ROLES.every((role) => this[role] === other[role]);
        }
        add(other) {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = this[role] + other[role];
          return m;
        }
        subtract(other) {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = this[role] - other[role];
          return m;
        }
        nonEmpty() {
          return ROLES.some((role) => this[role] > 0);
        }
        isEmpty() {
          return !this.nonEmpty();
        }
        hasPawns() {
          return this.pawn > 0;
        }
        hasNonPawns() {
          return this.knight > 0 || this.bishop > 0 || this.rook > 0 || this.queen > 0 || this.king > 0;
        }
        size() {
          return this.pawn + this.knight + this.bishop + this.rook + this.queen + this.king;
        }
      };
      Material = class _Material {
        constructor(white, black) {
          this.white = white;
          this.black = black;
        }
        static empty() {
          return new _Material(MaterialSide.empty(), MaterialSide.empty());
        }
        static fromBoard(board) {
          return new _Material(MaterialSide.fromBoard(board, "white"), MaterialSide.fromBoard(board, "black"));
        }
        clone() {
          return new _Material(this.white.clone(), this.black.clone());
        }
        equals(other) {
          return this.white.equals(other.white) && this.black.equals(other.black);
        }
        add(other) {
          return new _Material(this.white.add(other.white), this.black.add(other.black));
        }
        subtract(other) {
          return new _Material(this.white.subtract(other.white), this.black.subtract(other.black));
        }
        count(role) {
          return this.white[role] + this.black[role];
        }
        size() {
          return this.white.size() + this.black.size();
        }
        isEmpty() {
          return this.white.isEmpty() && this.black.isEmpty();
        }
        nonEmpty() {
          return !this.isEmpty();
        }
        hasPawns() {
          return this.white.hasPawns() || this.black.hasPawns();
        }
        hasNonPawns() {
          return this.white.hasNonPawns() || this.black.hasNonPawns();
        }
      };
      RemainingChecks = class _RemainingChecks {
        constructor(white, black) {
          this.white = white;
          this.black = black;
        }
        static default() {
          return new _RemainingChecks(3, 3);
        }
        clone() {
          return new _RemainingChecks(this.white, this.black);
        }
        equals(other) {
          return this.white === other.white && this.black === other.black;
        }
      };
    }
  });

  // node_modules/@badrap/result/dist/index.modern.mjs
  var r, t, e, n;
  var init_index_modern = __esm({
    "node_modules/@badrap/result/dist/index.modern.mjs"() {
      r = class {
        unwrap(r2, t2) {
          const e2 = this._chain((t3) => n.ok(r2 ? r2(t3) : t3), (r3) => t2 ? n.ok(t2(r3)) : n.err(r3));
          if (e2.isErr) throw e2.error;
          return e2.value;
        }
        map(r2, t2) {
          return this._chain((t3) => n.ok(r2(t3)), (r3) => n.err(t2 ? t2(r3) : r3));
        }
        chain(r2, t2) {
          return this._chain(r2, t2 || ((r3) => n.err(r3)));
        }
      };
      t = class extends r {
        constructor(r2) {
          super(), this.value = void 0, this.isOk = true, this.isErr = false, this.value = r2;
        }
        _chain(r2, t2) {
          return r2(this.value);
        }
      };
      e = class extends r {
        constructor(r2) {
          super(), this.error = void 0, this.isOk = false, this.isErr = true, this.error = r2;
        }
        _chain(r2, t2) {
          return t2(this.error);
        }
      };
      !function(r2) {
        r2.ok = function(r3) {
          return new t(r3);
        }, r2.err = function(r3) {
          return new e(r3 || new Error());
        }, r2.all = function(t2) {
          if (Array.isArray(t2)) {
            const e3 = [];
            for (let r3 = 0; r3 < t2.length; r3++) {
              const n3 = t2[r3];
              if (n3.isErr) return n3;
              e3.push(n3.value);
            }
            return r2.ok(e3);
          }
          const e2 = {}, n2 = Object.keys(t2);
          for (let r3 = 0; r3 < n2.length; r3++) {
            const s = t2[n2[r3]];
            if (s.isErr) return s;
            e2[n2[r3]] = s.value;
          }
          return r2.ok(e2);
        };
      }(n || (n = {}));
    }
  });

  // node_modules/chessops/dist/esm/chess.js
  var IllegalSetup, PositionError, attacksTo, Castles, Position, Chess, validEpSquare, legalEpSquare, canCaptureEp, castlingDest, pseudoDests, castlingSide, normalizeMove;
  var init_chess = __esm({
    "node_modules/chessops/dist/esm/chess.js"() {
      init_index_modern();
      init_attacks();
      init_board();
      init_squareSet();
      init_types();
      init_util();
      (function(IllegalSetup2) {
        IllegalSetup2["Empty"] = "ERR_EMPTY";
        IllegalSetup2["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
        IllegalSetup2["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
        IllegalSetup2["Kings"] = "ERR_KINGS";
        IllegalSetup2["Variant"] = "ERR_VARIANT";
      })(IllegalSetup || (IllegalSetup = {}));
      PositionError = class extends Error {
      };
      attacksTo = (square, attacker, board, occupied) => board[attacker].intersect(rookAttacks(square, occupied).intersect(board.rooksAndQueens()).union(bishopAttacks(square, occupied).intersect(board.bishopsAndQueens())).union(knightAttacks(square).intersect(board.knight)).union(kingAttacks(square).intersect(board.king)).union(pawnAttacks(opposite(attacker), square).intersect(board.pawn)));
      Castles = class _Castles {
        constructor() {
        }
        static default() {
          const castles = new _Castles();
          castles.castlingRights = SquareSet.corners();
          castles.rook = {
            white: { a: 0, h: 7 },
            black: { a: 56, h: 63 }
          };
          castles.path = {
            white: { a: new SquareSet(14, 0), h: new SquareSet(96, 0) },
            black: { a: new SquareSet(0, 234881024), h: new SquareSet(0, 1610612736) }
          };
          return castles;
        }
        static empty() {
          const castles = new _Castles();
          castles.castlingRights = SquareSet.empty();
          castles.rook = {
            white: { a: void 0, h: void 0 },
            black: { a: void 0, h: void 0 }
          };
          castles.path = {
            white: { a: SquareSet.empty(), h: SquareSet.empty() },
            black: { a: SquareSet.empty(), h: SquareSet.empty() }
          };
          return castles;
        }
        clone() {
          const castles = new _Castles();
          castles.castlingRights = this.castlingRights;
          castles.rook = {
            white: { a: this.rook.white.a, h: this.rook.white.h },
            black: { a: this.rook.black.a, h: this.rook.black.h }
          };
          castles.path = {
            white: { a: this.path.white.a, h: this.path.white.h },
            black: { a: this.path.black.a, h: this.path.black.h }
          };
          return castles;
        }
        add(color, side, king, rook) {
          const kingTo = kingCastlesTo(color, side);
          const rookTo = rookCastlesTo(color, side);
          this.castlingRights = this.castlingRights.with(rook);
          this.rook[color][side] = rook;
          this.path[color][side] = between(rook, rookTo).with(rookTo).union(between(king, kingTo).with(kingTo)).without(king).without(rook);
        }
        static fromSetup(setup) {
          const castles = _Castles.empty();
          const rooks = setup.castlingRights.intersect(setup.board.rook);
          for (const color of COLORS) {
            const backrank = SquareSet.backrank(color);
            const king = setup.board.kingOf(color);
            if (!defined(king) || !backrank.has(king))
              continue;
            const side = rooks.intersect(setup.board[color]).intersect(backrank);
            const aSide = side.first();
            if (defined(aSide) && aSide < king)
              castles.add(color, "a", king, aSide);
            const hSide = side.last();
            if (defined(hSide) && king < hSide)
              castles.add(color, "h", king, hSide);
          }
          return castles;
        }
        discardRook(square) {
          if (this.castlingRights.has(square)) {
            this.castlingRights = this.castlingRights.without(square);
            for (const color of COLORS) {
              for (const side of CASTLING_SIDES) {
                if (this.rook[color][side] === square)
                  this.rook[color][side] = void 0;
              }
            }
          }
        }
        discardColor(color) {
          this.castlingRights = this.castlingRights.diff(SquareSet.backrank(color));
          this.rook[color].a = void 0;
          this.rook[color].h = void 0;
        }
      };
      Position = class {
        constructor(rules) {
          this.rules = rules;
        }
        reset() {
          this.board = Board.default();
          this.pockets = void 0;
          this.turn = "white";
          this.castles = Castles.default();
          this.epSquare = void 0;
          this.remainingChecks = void 0;
          this.halfmoves = 0;
          this.fullmoves = 1;
        }
        setupUnchecked(setup) {
          this.board = setup.board.clone();
          this.board.promoted = SquareSet.empty();
          this.pockets = void 0;
          this.turn = setup.turn;
          this.castles = Castles.fromSetup(setup);
          this.epSquare = validEpSquare(this, setup.epSquare);
          this.remainingChecks = void 0;
          this.halfmoves = setup.halfmoves;
          this.fullmoves = setup.fullmoves;
        }
        // When subclassing overwrite at least:
        //
        // - static default()
        // - static fromSetup()
        // - static clone()
        //
        // - dests()
        // - isVariantEnd()
        // - variantOutcome()
        // - hasInsufficientMaterial()
        // - isStandardMaterial()
        kingAttackers(square, attacker, occupied) {
          return attacksTo(square, attacker, this.board, occupied);
        }
        playCaptureAt(square, captured) {
          this.halfmoves = 0;
          if (captured.role === "rook")
            this.castles.discardRook(square);
          if (this.pockets)
            this.pockets[opposite(captured.color)][captured.promoted ? "pawn" : captured.role]++;
        }
        ctx() {
          const variantEnd = this.isVariantEnd();
          const king = this.board.kingOf(this.turn);
          if (!defined(king)) {
            return { king, blockers: SquareSet.empty(), checkers: SquareSet.empty(), variantEnd, mustCapture: false };
          }
          const snipers = rookAttacks(king, SquareSet.empty()).intersect(this.board.rooksAndQueens()).union(bishopAttacks(king, SquareSet.empty()).intersect(this.board.bishopsAndQueens())).intersect(this.board[opposite(this.turn)]);
          let blockers = SquareSet.empty();
          for (const sniper of snipers) {
            const b = between(king, sniper).intersect(this.board.occupied);
            if (!b.moreThanOne())
              blockers = blockers.union(b);
          }
          const checkers = this.kingAttackers(king, opposite(this.turn), this.board.occupied);
          return {
            king,
            blockers,
            checkers,
            variantEnd,
            mustCapture: false
          };
        }
        clone() {
          var _a, _b;
          const pos = new this.constructor();
          pos.board = this.board.clone();
          pos.pockets = (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone();
          pos.turn = this.turn;
          pos.castles = this.castles.clone();
          pos.epSquare = this.epSquare;
          pos.remainingChecks = (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone();
          pos.halfmoves = this.halfmoves;
          pos.fullmoves = this.fullmoves;
          return pos;
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (this.board.king.size() !== 2)
            return n.err(new PositionError(IllegalSetup.Kings));
          if (!defined(this.board.kingOf(this.turn)))
            return n.err(new PositionError(IllegalSetup.Kings));
          const otherKing = this.board.kingOf(opposite(this.turn));
          if (!defined(otherKing))
            return n.err(new PositionError(IllegalSetup.Kings));
          if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
          }
          if (SquareSet.backranks().intersects(this.board.pawn)) {
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
          }
          return n.ok(void 0);
        }
        dropDests(_ctx) {
          return SquareSet.empty();
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          if (ctx.variantEnd)
            return SquareSet.empty();
          const piece = this.board.get(square);
          if (!piece || piece.color !== this.turn)
            return SquareSet.empty();
          let pseudo, legal;
          if (piece.role === "pawn") {
            pseudo = pawnAttacks(this.turn, square).intersect(this.board[opposite(this.turn)]);
            const delta = this.turn === "white" ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
              pseudo = pseudo.with(step);
              const canDoubleStep = this.turn === "white" ? square < 16 : square >= 64 - 16;
              const doubleStep = step + delta;
              if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                pseudo = pseudo.with(doubleStep);
              }
            }
            if (defined(this.epSquare) && canCaptureEp(this, square, ctx)) {
              legal = SquareSet.fromSquare(this.epSquare);
            }
          } else if (piece.role === "bishop")
            pseudo = bishopAttacks(square, this.board.occupied);
          else if (piece.role === "knight")
            pseudo = knightAttacks(square);
          else if (piece.role === "rook")
            pseudo = rookAttacks(square, this.board.occupied);
          else if (piece.role === "queen")
            pseudo = queenAttacks(square, this.board.occupied);
          else
            pseudo = kingAttacks(square);
          pseudo = pseudo.diff(this.board[this.turn]);
          if (defined(ctx.king)) {
            if (piece.role === "king") {
              const occ = this.board.occupied.without(square);
              for (const to of pseudo) {
                if (this.kingAttackers(to, opposite(this.turn), occ).nonEmpty())
                  pseudo = pseudo.without(to);
              }
              return pseudo.union(castlingDest(this, "a", ctx)).union(castlingDest(this, "h", ctx));
            }
            if (ctx.checkers.nonEmpty()) {
              const checker = ctx.checkers.singleSquare();
              if (!defined(checker))
                return SquareSet.empty();
              pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
            }
            if (ctx.blockers.has(square))
              pseudo = pseudo.intersect(ray(square, ctx.king));
          }
          if (legal)
            pseudo = pseudo.union(legal);
          return pseudo;
        }
        isVariantEnd() {
          return false;
        }
        variantOutcome(_ctx) {
          return;
        }
        hasInsufficientMaterial(color) {
          if (this.board[color].intersect(this.board.pawn.union(this.board.rooksAndQueens())).nonEmpty())
            return false;
          if (this.board[color].intersects(this.board.knight)) {
            return this.board[color].size() <= 2 && this.board[opposite(color)].diff(this.board.king).diff(this.board.queen).isEmpty();
          }
          if (this.board[color].intersects(this.board.bishop)) {
            const sameColor = !this.board.bishop.intersects(SquareSet.darkSquares()) || !this.board.bishop.intersects(SquareSet.lightSquares());
            return sameColor && this.board.pawn.isEmpty() && this.board.knight.isEmpty();
          }
          return true;
        }
        // The following should be identical in all subclasses
        toSetup() {
          var _a, _b;
          return {
            board: this.board.clone(),
            pockets: (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
            turn: this.turn,
            castlingRights: this.castles.castlingRights,
            epSquare: legalEpSquare(this),
            remainingChecks: (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
            halfmoves: Math.min(this.halfmoves, 150),
            fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999)
          };
        }
        isInsufficientMaterial() {
          return COLORS.every((color) => this.hasInsufficientMaterial(color));
        }
        hasDests(ctx) {
          ctx = ctx || this.ctx();
          for (const square of this.board[this.turn]) {
            if (this.dests(square, ctx).nonEmpty())
              return true;
          }
          return this.dropDests(ctx).nonEmpty();
        }
        isLegal(move, ctx) {
          if (isDrop(move)) {
            if (!this.pockets || this.pockets[this.turn][move.role] <= 0)
              return false;
            if (move.role === "pawn" && SquareSet.backranks().has(move.to))
              return false;
            return this.dropDests(ctx).has(move.to);
          } else {
            if (move.promotion === "pawn")
              return false;
            if (move.promotion === "king" && this.rules !== "antichess")
              return false;
            if (!!move.promotion !== (this.board.pawn.has(move.from) && SquareSet.backranks().has(move.to)))
              return false;
            const dests = this.dests(move.from, ctx);
            return dests.has(move.to) || dests.has(normalizeMove(this, move).to);
          }
        }
        isCheck() {
          const king = this.board.kingOf(this.turn);
          return defined(king) && this.kingAttackers(king, opposite(this.turn), this.board.occupied).nonEmpty();
        }
        isEnd(ctx) {
          if (ctx ? ctx.variantEnd : this.isVariantEnd())
            return true;
          return this.isInsufficientMaterial() || !this.hasDests(ctx);
        }
        isCheckmate(ctx) {
          ctx = ctx || this.ctx();
          return !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx);
        }
        isStalemate(ctx) {
          ctx = ctx || this.ctx();
          return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
        }
        outcome(ctx) {
          const variantOutcome = this.variantOutcome(ctx);
          if (variantOutcome)
            return variantOutcome;
          ctx = ctx || this.ctx();
          if (this.isCheckmate(ctx))
            return { winner: opposite(this.turn) };
          else if (this.isInsufficientMaterial() || this.isStalemate(ctx))
            return { winner: void 0 };
          else
            return;
        }
        allDests(ctx) {
          ctx = ctx || this.ctx();
          const d = /* @__PURE__ */ new Map();
          if (ctx.variantEnd)
            return d;
          for (const square of this.board[this.turn]) {
            d.set(square, this.dests(square, ctx));
          }
          return d;
        }
        play(move) {
          const turn = this.turn;
          const epSquare = this.epSquare;
          const castling = castlingSide(this, move);
          this.epSquare = void 0;
          this.halfmoves += 1;
          if (turn === "black")
            this.fullmoves += 1;
          this.turn = opposite(turn);
          if (isDrop(move)) {
            this.board.set(move.to, { role: move.role, color: turn });
            if (this.pockets)
              this.pockets[turn][move.role]--;
            if (move.role === "pawn")
              this.halfmoves = 0;
          } else {
            const piece = this.board.take(move.from);
            if (!piece)
              return;
            let epCapture;
            if (piece.role === "pawn") {
              this.halfmoves = 0;
              if (move.to === epSquare) {
                epCapture = this.board.take(move.to + (turn === "white" ? -8 : 8));
              }
              const delta = move.from - move.to;
              if (Math.abs(delta) === 16 && 8 <= move.from && move.from <= 55) {
                this.epSquare = move.from + move.to >> 1;
              }
              if (move.promotion) {
                piece.role = move.promotion;
                piece.promoted = !!this.pockets;
              }
            } else if (piece.role === "rook") {
              this.castles.discardRook(move.from);
            } else if (piece.role === "king") {
              if (castling) {
                const rookFrom = this.castles.rook[turn][castling];
                if (defined(rookFrom)) {
                  const rook = this.board.take(rookFrom);
                  this.board.set(kingCastlesTo(turn, castling), piece);
                  if (rook)
                    this.board.set(rookCastlesTo(turn, castling), rook);
                }
              }
              this.castles.discardColor(turn);
            }
            if (!castling) {
              const capture = this.board.set(move.to, piece) || epCapture;
              if (capture)
                this.playCaptureAt(move.to, capture);
            }
          }
          if (this.remainingChecks) {
            if (this.isCheck())
              this.remainingChecks[turn] = Math.max(this.remainingChecks[turn] - 1, 0);
          }
        }
      };
      Chess = class extends Position {
        constructor() {
          super("chess");
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
      };
      validEpSquare = (pos, square) => {
        if (!defined(square))
          return;
        const epRank = pos.turn === "white" ? 5 : 2;
        const forward = pos.turn === "white" ? 8 : -8;
        if (squareRank(square) !== epRank)
          return;
        if (pos.board.occupied.has(square + forward))
          return;
        const pawn = square - forward;
        if (!pos.board.pawn.has(pawn) || !pos.board[opposite(pos.turn)].has(pawn))
          return;
        return square;
      };
      legalEpSquare = (pos) => {
        if (!defined(pos.epSquare))
          return;
        const ctx = pos.ctx();
        const ourPawns = pos.board.pieces(pos.turn, "pawn");
        const candidates = ourPawns.intersect(pawnAttacks(opposite(pos.turn), pos.epSquare));
        for (const candidate of candidates) {
          if (pos.dests(candidate, ctx).has(pos.epSquare))
            return pos.epSquare;
        }
        return;
      };
      canCaptureEp = (pos, pawnFrom, ctx) => {
        if (!defined(pos.epSquare))
          return false;
        if (!pawnAttacks(pos.turn, pawnFrom).has(pos.epSquare))
          return false;
        if (!defined(ctx.king))
          return true;
        const delta = pos.turn === "white" ? 8 : -8;
        const captured = pos.epSquare - delta;
        return pos.kingAttackers(ctx.king, opposite(pos.turn), pos.board.occupied.toggle(pawnFrom).toggle(captured).with(pos.epSquare)).without(captured).isEmpty();
      };
      castlingDest = (pos, side, ctx) => {
        if (!defined(ctx.king) || ctx.checkers.nonEmpty())
          return SquareSet.empty();
        const rook = pos.castles.rook[pos.turn][side];
        if (!defined(rook))
          return SquareSet.empty();
        if (pos.castles.path[pos.turn][side].intersects(pos.board.occupied))
          return SquareSet.empty();
        const kingTo = kingCastlesTo(pos.turn, side);
        const kingPath = between(ctx.king, kingTo);
        const occ = pos.board.occupied.without(ctx.king);
        for (const sq of kingPath) {
          if (pos.kingAttackers(sq, opposite(pos.turn), occ).nonEmpty())
            return SquareSet.empty();
        }
        const rookTo = rookCastlesTo(pos.turn, side);
        const after = pos.board.occupied.toggle(ctx.king).toggle(rook).toggle(rookTo);
        if (pos.kingAttackers(kingTo, opposite(pos.turn), after).nonEmpty())
          return SquareSet.empty();
        return SquareSet.fromSquare(rook);
      };
      pseudoDests = (pos, square, ctx) => {
        if (ctx.variantEnd)
          return SquareSet.empty();
        const piece = pos.board.get(square);
        if (!piece || piece.color !== pos.turn)
          return SquareSet.empty();
        let pseudo = attacks(piece, square, pos.board.occupied);
        if (piece.role === "pawn") {
          let captureTargets = pos.board[opposite(pos.turn)];
          if (defined(pos.epSquare))
            captureTargets = captureTargets.with(pos.epSquare);
          pseudo = pseudo.intersect(captureTargets);
          const delta = pos.turn === "white" ? 8 : -8;
          const step = square + delta;
          if (0 <= step && step < 64 && !pos.board.occupied.has(step)) {
            pseudo = pseudo.with(step);
            const canDoubleStep = pos.turn === "white" ? square < 16 : square >= 64 - 16;
            const doubleStep = step + delta;
            if (canDoubleStep && !pos.board.occupied.has(doubleStep)) {
              pseudo = pseudo.with(doubleStep);
            }
          }
          return pseudo;
        } else {
          pseudo = pseudo.diff(pos.board[pos.turn]);
        }
        if (square === ctx.king)
          return pseudo.union(castlingDest(pos, "a", ctx)).union(castlingDest(pos, "h", ctx));
        else
          return pseudo;
      };
      castlingSide = (pos, move) => {
        if (isDrop(move))
          return;
        const delta = move.to - move.from;
        if (Math.abs(delta) !== 2 && !pos.board[pos.turn].has(move.to))
          return;
        if (!pos.board.king.has(move.from))
          return;
        return delta > 0 ? "h" : "a";
      };
      normalizeMove = (pos, move) => {
        const side = castlingSide(pos, move);
        if (!side)
          return move;
        const rookFrom = pos.castles.rook[pos.turn][side];
        return {
          from: move.from,
          to: defined(rookFrom) ? rookFrom : move.to
        };
      };
    }
  });

  // node_modules/chessops/dist/esm/fen.js
  var fen_exports = {};
  __export(fen_exports, {
    EMPTY_BOARD_FEN: () => EMPTY_BOARD_FEN,
    EMPTY_EPD: () => EMPTY_EPD,
    EMPTY_FEN: () => EMPTY_FEN,
    FenError: () => FenError,
    INITIAL_BOARD_FEN: () => INITIAL_BOARD_FEN,
    INITIAL_EPD: () => INITIAL_EPD,
    INITIAL_FEN: () => INITIAL_FEN,
    InvalidFen: () => InvalidFen,
    makeBoardFen: () => makeBoardFen,
    makeCastlingFen: () => makeCastlingFen,
    makeFen: () => makeFen,
    makePiece: () => makePiece,
    makePocket: () => makePocket,
    makePockets: () => makePockets,
    makeRemainingChecks: () => makeRemainingChecks,
    parseBoardFen: () => parseBoardFen,
    parseCastlingFen: () => parseCastlingFen,
    parseFen: () => parseFen,
    parsePiece: () => parsePiece,
    parsePockets: () => parsePockets,
    parseRemainingChecks: () => parseRemainingChecks
  });
  var INITIAL_BOARD_FEN, INITIAL_EPD, INITIAL_FEN, EMPTY_BOARD_FEN, EMPTY_EPD, EMPTY_FEN, InvalidFen, FenError, nthIndexOf, parseSmallUint, charToPiece, parseBoardFen, parsePockets, parseCastlingFen, parseRemainingChecks, parseFen, parsePiece, makePiece, makeBoardFen, makePocket, makePockets, makeCastlingFen, makeRemainingChecks, makeFen;
  var init_fen = __esm({
    "node_modules/chessops/dist/esm/fen.js"() {
      init_index_modern();
      init_board();
      init_setup();
      init_squareSet();
      init_types();
      init_util();
      INITIAL_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
      INITIAL_EPD = INITIAL_BOARD_FEN + " w KQkq -";
      INITIAL_FEN = INITIAL_EPD + " 0 1";
      EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8";
      EMPTY_EPD = EMPTY_BOARD_FEN + " w - -";
      EMPTY_FEN = EMPTY_EPD + " 0 1";
      (function(InvalidFen2) {
        InvalidFen2["Fen"] = "ERR_FEN";
        InvalidFen2["Board"] = "ERR_BOARD";
        InvalidFen2["Pockets"] = "ERR_POCKETS";
        InvalidFen2["Turn"] = "ERR_TURN";
        InvalidFen2["Castling"] = "ERR_CASTLING";
        InvalidFen2["EpSquare"] = "ERR_EP_SQUARE";
        InvalidFen2["RemainingChecks"] = "ERR_REMAINING_CHECKS";
        InvalidFen2["Halfmoves"] = "ERR_HALFMOVES";
        InvalidFen2["Fullmoves"] = "ERR_FULLMOVES";
      })(InvalidFen || (InvalidFen = {}));
      FenError = class extends Error {
      };
      nthIndexOf = (haystack, needle, n2) => {
        let index = haystack.indexOf(needle);
        while (n2-- > 0) {
          if (index === -1)
            break;
          index = haystack.indexOf(needle, index + needle.length);
        }
        return index;
      };
      parseSmallUint = (str) => /^\d{1,4}$/.test(str) ? parseInt(str, 10) : void 0;
      charToPiece = (ch) => {
        const role = charToRole(ch);
        return role && { role, color: ch.toLowerCase() === ch ? "black" : "white" };
      };
      parseBoardFen = (boardPart) => {
        const board = Board.empty();
        let rank = 7;
        let file = 0;
        for (let i = 0; i < boardPart.length; i++) {
          const c = boardPart[i];
          if (c === "/" && file === 8) {
            file = 0;
            rank--;
          } else {
            const step = parseInt(c, 10);
            if (step > 0)
              file += step;
            else {
              if (file >= 8 || rank < 0)
                return n.err(new FenError(InvalidFen.Board));
              const square = file + rank * 8;
              const piece = charToPiece(c);
              if (!piece)
                return n.err(new FenError(InvalidFen.Board));
              if (boardPart[i + 1] === "~") {
                piece.promoted = true;
                i++;
              }
              board.set(square, piece);
              file++;
            }
          }
        }
        if (rank !== 0 || file !== 8)
          return n.err(new FenError(InvalidFen.Board));
        return n.ok(board);
      };
      parsePockets = (pocketPart) => {
        if (pocketPart.length > 64)
          return n.err(new FenError(InvalidFen.Pockets));
        const pockets = Material.empty();
        for (const c of pocketPart) {
          const piece = charToPiece(c);
          if (!piece)
            return n.err(new FenError(InvalidFen.Pockets));
          pockets[piece.color][piece.role]++;
        }
        return n.ok(pockets);
      };
      parseCastlingFen = (board, castlingPart) => {
        let castlingRights = SquareSet.empty();
        if (castlingPart === "-")
          return n.ok(castlingRights);
        for (const c of castlingPart) {
          const lower = c.toLowerCase();
          const color = c === lower ? "black" : "white";
          const rank = color === "white" ? 0 : 7;
          if ("a" <= lower && lower <= "h") {
            castlingRights = castlingRights.with(squareFromCoords(lower.charCodeAt(0) - "a".charCodeAt(0), rank));
          } else if (lower === "k" || lower === "q") {
            const rooksAndKings = board[color].intersect(SquareSet.backrank(color)).intersect(board.rook.union(board.king));
            const candidate = lower === "k" ? rooksAndKings.last() : rooksAndKings.first();
            castlingRights = castlingRights.with(defined(candidate) && board.rook.has(candidate) ? candidate : squareFromCoords(lower === "k" ? 7 : 0, rank));
          } else
            return n.err(new FenError(InvalidFen.Castling));
        }
        if (COLORS.some((color) => SquareSet.backrank(color).intersect(castlingRights).size() > 2)) {
          return n.err(new FenError(InvalidFen.Castling));
        }
        return n.ok(castlingRights);
      };
      parseRemainingChecks = (part) => {
        const parts = part.split("+");
        if (parts.length === 3 && parts[0] === "") {
          const white = parseSmallUint(parts[1]);
          const black = parseSmallUint(parts[2]);
          if (!defined(white) || white > 3 || !defined(black) || black > 3) {
            return n.err(new FenError(InvalidFen.RemainingChecks));
          }
          return n.ok(new RemainingChecks(3 - white, 3 - black));
        } else if (parts.length === 2) {
          const white = parseSmallUint(parts[0]);
          const black = parseSmallUint(parts[1]);
          if (!defined(white) || white > 3 || !defined(black) || black > 3) {
            return n.err(new FenError(InvalidFen.RemainingChecks));
          }
          return n.ok(new RemainingChecks(white, black));
        } else
          return n.err(new FenError(InvalidFen.RemainingChecks));
      };
      parseFen = (fen) => {
        const parts = fen.split(/[\s_]+/);
        const boardPart = parts.shift();
        let board;
        let pockets = n.ok(void 0);
        if (boardPart.endsWith("]")) {
          const pocketStart = boardPart.indexOf("[");
          if (pocketStart === -1)
            return n.err(new FenError(InvalidFen.Fen));
          board = parseBoardFen(boardPart.slice(0, pocketStart));
          pockets = parsePockets(boardPart.slice(pocketStart + 1, -1));
        } else {
          const pocketStart = nthIndexOf(boardPart, "/", 7);
          if (pocketStart === -1)
            board = parseBoardFen(boardPart);
          else {
            board = parseBoardFen(boardPart.slice(0, pocketStart));
            pockets = parsePockets(boardPart.slice(pocketStart + 1));
          }
        }
        let turn;
        const turnPart = parts.shift();
        if (!defined(turnPart) || turnPart === "w")
          turn = "white";
        else if (turnPart === "b")
          turn = "black";
        else
          return n.err(new FenError(InvalidFen.Turn));
        return board.chain((board2) => {
          const castlingPart = parts.shift();
          const castlingRights = defined(castlingPart) ? parseCastlingFen(board2, castlingPart) : n.ok(SquareSet.empty());
          const epPart = parts.shift();
          let epSquare;
          if (defined(epPart) && epPart !== "-") {
            epSquare = parseSquare(epPart);
            if (!defined(epSquare))
              return n.err(new FenError(InvalidFen.EpSquare));
          }
          let halfmovePart = parts.shift();
          let earlyRemainingChecks;
          if (defined(halfmovePart) && halfmovePart.includes("+")) {
            earlyRemainingChecks = parseRemainingChecks(halfmovePart);
            halfmovePart = parts.shift();
          }
          const halfmoves = defined(halfmovePart) ? parseSmallUint(halfmovePart) : 0;
          if (!defined(halfmoves))
            return n.err(new FenError(InvalidFen.Halfmoves));
          const fullmovesPart = parts.shift();
          const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
          if (!defined(fullmoves))
            return n.err(new FenError(InvalidFen.Fullmoves));
          const remainingChecksPart = parts.shift();
          let remainingChecks = n.ok(void 0);
          if (defined(remainingChecksPart)) {
            if (defined(earlyRemainingChecks))
              return n.err(new FenError(InvalidFen.RemainingChecks));
            remainingChecks = parseRemainingChecks(remainingChecksPart);
          } else if (defined(earlyRemainingChecks)) {
            remainingChecks = earlyRemainingChecks;
          }
          if (parts.length > 0)
            return n.err(new FenError(InvalidFen.Fen));
          return pockets.chain((pockets2) => castlingRights.chain((castlingRights2) => remainingChecks.map((remainingChecks2) => {
            return {
              board: board2,
              pockets: pockets2,
              turn,
              castlingRights: castlingRights2,
              remainingChecks: remainingChecks2,
              epSquare,
              halfmoves,
              fullmoves: Math.max(1, fullmoves)
            };
          })));
        });
      };
      parsePiece = (str) => {
        if (!str)
          return;
        const piece = charToPiece(str[0]);
        if (!piece)
          return;
        if (str.length === 2 && str[1] === "~")
          piece.promoted = true;
        else if (str.length > 1)
          return;
        return piece;
      };
      makePiece = (piece) => {
        let r2 = roleToChar(piece.role);
        if (piece.color === "white")
          r2 = r2.toUpperCase();
        if (piece.promoted)
          r2 += "~";
        return r2;
      };
      makeBoardFen = (board) => {
        let fen = "";
        let empty = 0;
        for (let rank = 7; rank >= 0; rank--) {
          for (let file = 0; file < 8; file++) {
            const square = file + rank * 8;
            const piece = board.get(square);
            if (!piece)
              empty++;
            else {
              if (empty > 0) {
                fen += empty;
                empty = 0;
              }
              fen += makePiece(piece);
            }
            if (file === 7) {
              if (empty > 0) {
                fen += empty;
                empty = 0;
              }
              if (rank !== 0)
                fen += "/";
            }
          }
        }
        return fen;
      };
      makePocket = (material) => ROLES.map((role) => roleToChar(role).repeat(material[role])).join("");
      makePockets = (pocket) => makePocket(pocket.white).toUpperCase() + makePocket(pocket.black);
      makeCastlingFen = (board, castlingRights) => {
        let fen = "";
        for (const color of COLORS) {
          const backrank = SquareSet.backrank(color);
          let king = board.kingOf(color);
          if (defined(king) && !backrank.has(king))
            king = void 0;
          const candidates = board.pieces(color, "rook").intersect(backrank);
          for (const rook of castlingRights.intersect(backrank).reversed()) {
            if (rook === candidates.first() && defined(king) && rook < king) {
              fen += color === "white" ? "Q" : "q";
            } else if (rook === candidates.last() && defined(king) && king < rook) {
              fen += color === "white" ? "K" : "k";
            } else {
              const file = FILE_NAMES[squareFile(rook)];
              fen += color === "white" ? file.toUpperCase() : file;
            }
          }
        }
        return fen || "-";
      };
      makeRemainingChecks = (checks) => `${checks.white}+${checks.black}`;
      makeFen = (setup, opts) => [
        makeBoardFen(setup.board) + (setup.pockets ? `[${makePockets(setup.pockets)}]` : ""),
        setup.turn[0],
        makeCastlingFen(setup.board, setup.castlingRights),
        defined(setup.epSquare) ? makeSquare(setup.epSquare) : "-",
        ...setup.remainingChecks ? [makeRemainingChecks(setup.remainingChecks)] : [],
        ...(opts === null || opts === void 0 ? void 0 : opts.epd) ? [] : [Math.max(0, Math.min(setup.halfmoves, 9999)), Math.max(1, Math.min(setup.fullmoves, 9999))]
      ].join(" ");
    }
  });

  // node_modules/chessops/dist/esm/san.js
  var san_exports = {};
  __export(san_exports, {
    makeSan: () => makeSan,
    makeSanAndPlay: () => makeSanAndPlay,
    makeSanVariation: () => makeSanVariation,
    parseSan: () => parseSan
  });
  var makeSanWithoutSuffix, makeSanAndPlay, makeSanVariation, makeSan, parseSan;
  var init_san = __esm({
    "node_modules/chessops/dist/esm/san.js"() {
      init_attacks();
      init_squareSet();
      init_types();
      init_util();
      makeSanWithoutSuffix = (pos, move) => {
        let san = "";
        if (isDrop(move)) {
          if (move.role !== "pawn")
            san = roleToChar(move.role).toUpperCase();
          san += "@" + makeSquare(move.to);
        } else {
          const role = pos.board.getRole(move.from);
          if (!role)
            return "--";
          if (role === "king" && (pos.board[pos.turn].has(move.to) || Math.abs(move.to - move.from) === 2)) {
            san = move.to > move.from ? "O-O" : "O-O-O";
          } else {
            const capture = pos.board.occupied.has(move.to) || role === "pawn" && squareFile(move.from) !== squareFile(move.to);
            if (role !== "pawn") {
              san = roleToChar(role).toUpperCase();
              let others;
              if (role === "king")
                others = kingAttacks(move.to).intersect(pos.board.king);
              else if (role === "queen")
                others = queenAttacks(move.to, pos.board.occupied).intersect(pos.board.queen);
              else if (role === "rook")
                others = rookAttacks(move.to, pos.board.occupied).intersect(pos.board.rook);
              else if (role === "bishop")
                others = bishopAttacks(move.to, pos.board.occupied).intersect(pos.board.bishop);
              else
                others = knightAttacks(move.to).intersect(pos.board.knight);
              others = others.intersect(pos.board[pos.turn]).without(move.from);
              if (others.nonEmpty()) {
                const ctx = pos.ctx();
                for (const from of others) {
                  if (!pos.dests(from, ctx).has(move.to))
                    others = others.without(from);
                }
                if (others.nonEmpty()) {
                  let row = false;
                  let column = others.intersects(SquareSet.fromRank(squareRank(move.from)));
                  if (others.intersects(SquareSet.fromFile(squareFile(move.from))))
                    row = true;
                  else
                    column = true;
                  if (column)
                    san += FILE_NAMES[squareFile(move.from)];
                  if (row)
                    san += RANK_NAMES[squareRank(move.from)];
                }
              }
            } else if (capture)
              san = FILE_NAMES[squareFile(move.from)];
            if (capture)
              san += "x";
            san += makeSquare(move.to);
            if (move.promotion)
              san += "=" + roleToChar(move.promotion).toUpperCase();
          }
        }
        return san;
      };
      makeSanAndPlay = (pos, move) => {
        var _a;
        const san = makeSanWithoutSuffix(pos, move);
        pos.play(move);
        if ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner)
          return san + "#";
        if (pos.isCheck())
          return san + "+";
        return san;
      };
      makeSanVariation = (pos, variation) => {
        var _a;
        pos = pos.clone();
        const line = [];
        for (let i = 0; i < variation.length; i++) {
          if (i !== 0)
            line.push(" ");
          if (pos.turn === "white")
            line.push(pos.fullmoves, ". ");
          else if (i === 0)
            line.push(pos.fullmoves, "... ");
          const san = makeSanWithoutSuffix(pos, variation[i]);
          pos.play(variation[i]);
          line.push(san);
          if (san === "--")
            return line.join("");
          if (i === variation.length - 1 && ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner))
            line.push("#");
          else if (pos.isCheck())
            line.push("+");
        }
        return line.join("");
      };
      makeSan = (pos, move) => makeSanAndPlay(pos.clone(), move);
      parseSan = (pos, san) => {
        const ctx = pos.ctx();
        const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/);
        if (!match) {
          let castlingSide2;
          if (san === "O-O" || san === "O-O+" || san === "O-O#")
            castlingSide2 = "h";
          else if (san === "O-O-O" || san === "O-O-O+" || san === "O-O-O#")
            castlingSide2 = "a";
          if (castlingSide2) {
            const rook = pos.castles.rook[pos.turn][castlingSide2];
            if (!defined(ctx.king) || !defined(rook) || !pos.dests(ctx.king, ctx).has(rook))
              return;
            return {
              from: ctx.king,
              to: rook
            };
          }
          const match2 = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[+#]?$/);
          if (!match2)
            return;
          const move = {
            role: match2[1] ? charToRole(match2[1]) : "pawn",
            to: parseSquare(match2[2])
          };
          return pos.isLegal(move, ctx) ? move : void 0;
        }
        const role = match[1] ? charToRole(match[1]) : "pawn";
        const to = parseSquare(match[4]);
        const promotion = match[5] ? charToRole(match[5]) : void 0;
        if (!!promotion !== (role === "pawn" && SquareSet.backranks().has(to)))
          return;
        if (promotion === "king" && pos.rules !== "antichess")
          return;
        let candidates = pos.board.pieces(pos.turn, role);
        if (role === "pawn" && !match[2])
          candidates = candidates.intersect(SquareSet.fromFile(squareFile(to)));
        else if (match[2])
          candidates = candidates.intersect(SquareSet.fromFile(match[2].charCodeAt(0) - "a".charCodeAt(0)));
        if (match[3])
          candidates = candidates.intersect(SquareSet.fromRank(match[3].charCodeAt(0) - "1".charCodeAt(0)));
        const pawnAdvance = role === "pawn" ? SquareSet.fromFile(squareFile(to)) : SquareSet.empty();
        candidates = candidates.intersect(pawnAdvance.union(attacks({ color: opposite(pos.turn), role }, to, pos.board.occupied)));
        let from;
        for (const candidate of candidates) {
          if (pos.dests(candidate, ctx).has(to)) {
            if (defined(from))
              return;
            from = candidate;
          }
        }
        if (!defined(from))
          return;
        return {
          from,
          to,
          promotion
        };
      };
    }
  });

  // node_modules/chessops/dist/esm/variant.js
  var Crazyhouse, Atomic, Antichess, KingOfTheHill, ThreeCheck, racingKingsBoard, RacingKings, hordeBoard, Horde, defaultPosition, setupPosition;
  var init_variant = __esm({
    "node_modules/chessops/dist/esm/variant.js"() {
      init_index_modern();
      init_attacks();
      init_board();
      init_chess();
      init_setup();
      init_squareSet();
      init_types();
      init_util();
      Crazyhouse = class extends Position {
        constructor() {
          super("crazyhouse");
        }
        reset() {
          super.reset();
          this.pockets = Material.empty();
        }
        setupUnchecked(setup) {
          super.setupUnchecked(setup);
          this.board.promoted = setup.board.promoted.intersect(setup.board.occupied).diff(setup.board.king).diff(setup.board.pawn);
          this.pockets = setup.pockets ? setup.pockets.clone() : Material.empty();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          return super.validate().chain((_) => {
            var _a, _b;
            if ((_a = this.pockets) === null || _a === void 0 ? void 0 : _a.count("king")) {
              return n.err(new PositionError(IllegalSetup.Kings));
            }
            if ((((_b = this.pockets) === null || _b === void 0 ? void 0 : _b.size()) || 0) + this.board.occupied.size() > 64) {
              return n.err(new PositionError(IllegalSetup.Variant));
            }
            return n.ok(void 0);
          });
        }
        hasInsufficientMaterial(color) {
          if (!this.pockets)
            return super.hasInsufficientMaterial(color);
          return this.board.occupied.size() + this.pockets.size() <= 3 && this.board.pawn.isEmpty() && this.board.promoted.isEmpty() && this.board.rooksAndQueens().isEmpty() && this.pockets.count("pawn") <= 0 && this.pockets.count("rook") <= 0 && this.pockets.count("queen") <= 0;
        }
        dropDests(ctx) {
          var _a, _b;
          const mask = this.board.occupied.complement().intersect(((_a = this.pockets) === null || _a === void 0 ? void 0 : _a[this.turn].hasNonPawns()) ? SquareSet.full() : ((_b = this.pockets) === null || _b === void 0 ? void 0 : _b[this.turn].hasPawns()) ? SquareSet.backranks().complement() : SquareSet.empty());
          ctx = ctx || this.ctx();
          if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
            const checker = ctx.checkers.singleSquare();
            if (!defined(checker))
              return SquareSet.empty();
            return mask.intersect(between(checker, ctx.king));
          } else
            return mask;
        }
      };
      Atomic = class extends Position {
        constructor() {
          super("atomic");
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (this.board.king.size() > 2)
            return n.err(new PositionError(IllegalSetup.Kings));
          const otherKing = this.board.kingOf(opposite(this.turn));
          if (!defined(otherKing))
            return n.err(new PositionError(IllegalSetup.Kings));
          if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
          }
          if (SquareSet.backranks().intersects(this.board.pawn)) {
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
          }
          return n.ok(void 0);
        }
        kingAttackers(square, attacker, occupied) {
          const attackerKings = this.board.pieces(attacker, "king");
          if (attackerKings.isEmpty() || kingAttacks(square).intersects(attackerKings)) {
            return SquareSet.empty();
          }
          return super.kingAttackers(square, attacker, occupied);
        }
        playCaptureAt(square, captured) {
          super.playCaptureAt(square, captured);
          this.board.take(square);
          for (const explode of kingAttacks(square).intersect(this.board.occupied).diff(this.board.pawn)) {
            const piece = this.board.take(explode);
            if ((piece === null || piece === void 0 ? void 0 : piece.role) === "rook")
              this.castles.discardRook(explode);
            if ((piece === null || piece === void 0 ? void 0 : piece.role) === "king")
              this.castles.discardColor(piece.color);
          }
        }
        hasInsufficientMaterial(color) {
          if (this.board.pieces(opposite(color), "king").isEmpty())
            return false;
          if (this.board[color].diff(this.board.king).isEmpty())
            return true;
          if (this.board[opposite(color)].diff(this.board.king).nonEmpty()) {
            if (this.board.occupied.equals(this.board.bishop.union(this.board.king))) {
              if (!this.board.bishop.intersect(this.board.white).intersects(SquareSet.darkSquares())) {
                return !this.board.bishop.intersect(this.board.black).intersects(SquareSet.lightSquares());
              }
              if (!this.board.bishop.intersect(this.board.white).intersects(SquareSet.lightSquares())) {
                return !this.board.bishop.intersect(this.board.black).intersects(SquareSet.darkSquares());
              }
            }
            return false;
          }
          if (this.board.queen.nonEmpty() || this.board.pawn.nonEmpty())
            return false;
          if (this.board.knight.union(this.board.bishop).union(this.board.rook).size() === 1)
            return true;
          if (this.board.occupied.equals(this.board.knight.union(this.board.king))) {
            return this.board.knight.size() <= 2;
          }
          return false;
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          let dests = SquareSet.empty();
          for (const to of pseudoDests(this, square, ctx)) {
            const after = this.clone();
            after.play({ from: square, to });
            const ourKing = after.board.kingOf(this.turn);
            if (defined(ourKing) && (!defined(after.board.kingOf(after.turn)) || after.kingAttackers(ourKing, after.turn, after.board.occupied).isEmpty())) {
              dests = dests.with(to);
            }
          }
          return dests;
        }
        isVariantEnd() {
          return !!this.variantOutcome();
        }
        variantOutcome(_ctx) {
          for (const color of COLORS) {
            if (this.board.pieces(color, "king").isEmpty())
              return { winner: opposite(color) };
          }
          return;
        }
      };
      Antichess = class extends Position {
        constructor() {
          super("antichess");
        }
        reset() {
          super.reset();
          this.castles = Castles.empty();
        }
        setupUnchecked(setup) {
          super.setupUnchecked(setup);
          this.castles = Castles.empty();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (SquareSet.backranks().intersects(this.board.pawn)) {
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
          }
          return n.ok(void 0);
        }
        kingAttackers(_square, _attacker, _occupied) {
          return SquareSet.empty();
        }
        ctx() {
          const ctx = super.ctx();
          if (defined(this.epSquare) && pawnAttacks(opposite(this.turn), this.epSquare).intersects(this.board.pieces(this.turn, "pawn"))) {
            ctx.mustCapture = true;
            return ctx;
          }
          const enemy = this.board[opposite(this.turn)];
          for (const from of this.board[this.turn]) {
            if (pseudoDests(this, from, ctx).intersects(enemy)) {
              ctx.mustCapture = true;
              return ctx;
            }
          }
          return ctx;
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          const dests = pseudoDests(this, square, ctx);
          const enemy = this.board[opposite(this.turn)];
          return dests.intersect(ctx.mustCapture ? defined(this.epSquare) && this.board.getRole(square) === "pawn" ? enemy.with(this.epSquare) : enemy : SquareSet.full());
        }
        hasInsufficientMaterial(color) {
          if (this.board[color].isEmpty())
            return false;
          if (this.board[opposite(color)].isEmpty())
            return true;
          if (this.board.occupied.equals(this.board.bishop)) {
            const weSomeOnLight = this.board[color].intersects(SquareSet.lightSquares());
            const weSomeOnDark = this.board[color].intersects(SquareSet.darkSquares());
            const theyAllOnDark = this.board[opposite(color)].isDisjoint(SquareSet.lightSquares());
            const theyAllOnLight = this.board[opposite(color)].isDisjoint(SquareSet.darkSquares());
            return weSomeOnLight && theyAllOnDark || weSomeOnDark && theyAllOnLight;
          }
          if (this.board.occupied.equals(this.board.knight) && this.board.occupied.size() === 2) {
            return this.board.white.intersects(SquareSet.lightSquares()) !== this.board.black.intersects(SquareSet.darkSquares()) !== (this.turn === color);
          }
          return false;
        }
        isVariantEnd() {
          return this.board[this.turn].isEmpty();
        }
        variantOutcome(ctx) {
          ctx = ctx || this.ctx();
          if (ctx.variantEnd || this.isStalemate(ctx)) {
            return { winner: this.turn };
          }
          return;
        }
      };
      KingOfTheHill = class extends Position {
        constructor() {
          super("kingofthehill");
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        hasInsufficientMaterial(_color) {
          return false;
        }
        isVariantEnd() {
          return this.board.king.intersects(SquareSet.center());
        }
        variantOutcome(_ctx) {
          for (const color of COLORS) {
            if (this.board.pieces(color, "king").intersects(SquareSet.center()))
              return { winner: color };
          }
          return;
        }
      };
      ThreeCheck = class extends Position {
        constructor() {
          super("3check");
        }
        reset() {
          super.reset();
          this.remainingChecks = RemainingChecks.default();
        }
        setupUnchecked(setup) {
          var _a;
          super.setupUnchecked(setup);
          this.remainingChecks = ((_a = setup.remainingChecks) === null || _a === void 0 ? void 0 : _a.clone()) || RemainingChecks.default();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        hasInsufficientMaterial(color) {
          return this.board.pieces(color, "king").equals(this.board[color]);
        }
        isVariantEnd() {
          return !!this.remainingChecks && (this.remainingChecks.white <= 0 || this.remainingChecks.black <= 0);
        }
        variantOutcome(_ctx) {
          if (this.remainingChecks) {
            for (const color of COLORS) {
              if (this.remainingChecks[color] <= 0)
                return { winner: color };
            }
          }
          return;
        }
      };
      racingKingsBoard = () => {
        const board = Board.empty();
        board.occupied = new SquareSet(65535, 0);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(61680, 0);
        board.black = new SquareSet(3855, 0);
        board.pawn = SquareSet.empty();
        board.knight = new SquareSet(6168, 0);
        board.bishop = new SquareSet(9252, 0);
        board.rook = new SquareSet(16962, 0);
        board.queen = new SquareSet(129, 0);
        board.king = new SquareSet(33024, 0);
        return board;
      };
      RacingKings = class extends Position {
        constructor() {
          super("racingkings");
        }
        reset() {
          this.board = racingKingsBoard();
          this.pockets = void 0;
          this.turn = "white";
          this.castles = Castles.empty();
          this.epSquare = void 0;
          this.remainingChecks = void 0;
          this.halfmoves = 0;
          this.fullmoves = 1;
        }
        setupUnchecked(setup) {
          super.setupUnchecked(setup);
          this.castles = Castles.empty();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.isCheck() || this.board.pawn.nonEmpty())
            return n.err(new PositionError(IllegalSetup.Variant));
          return super.validate();
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          if (square === ctx.king)
            return super.dests(square, ctx);
          let dests = SquareSet.empty();
          for (const to of super.dests(square, ctx)) {
            const move = { from: square, to };
            const after = this.clone();
            after.play(move);
            if (!after.isCheck())
              dests = dests.with(to);
          }
          return dests;
        }
        hasInsufficientMaterial(_color) {
          return false;
        }
        isVariantEnd() {
          const goal = SquareSet.fromRank(7);
          const inGoal = this.board.king.intersect(goal);
          if (inGoal.isEmpty())
            return false;
          if (this.turn === "white" || inGoal.intersects(this.board.black))
            return true;
          const blackKing = this.board.kingOf("black");
          if (defined(blackKing)) {
            const occ = this.board.occupied.without(blackKing);
            for (const target of kingAttacks(blackKing).intersect(goal).diff(this.board.black)) {
              if (this.kingAttackers(target, "white", occ).isEmpty())
                return false;
            }
          }
          return true;
        }
        variantOutcome(ctx) {
          if (ctx ? !ctx.variantEnd : !this.isVariantEnd())
            return;
          const goal = SquareSet.fromRank(7);
          const blackInGoal = this.board.pieces("black", "king").intersects(goal);
          const whiteInGoal = this.board.pieces("white", "king").intersects(goal);
          if (blackInGoal && !whiteInGoal)
            return { winner: "black" };
          if (whiteInGoal && !blackInGoal)
            return { winner: "white" };
          return { winner: void 0 };
        }
      };
      hordeBoard = () => {
        const board = Board.empty();
        board.occupied = new SquareSet(4294967295, 4294901862);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(4294967295, 102);
        board.black = new SquareSet(0, 4294901760);
        board.pawn = new SquareSet(4294967295, 16711782);
        board.knight = new SquareSet(0, 1107296256);
        board.bishop = new SquareSet(0, 603979776);
        board.rook = new SquareSet(0, 2164260864);
        board.queen = new SquareSet(0, 134217728);
        board.king = new SquareSet(0, 268435456);
        return board;
      };
      Horde = class extends Position {
        constructor() {
          super("horde");
        }
        reset() {
          this.board = hordeBoard();
          this.pockets = void 0;
          this.turn = "white";
          this.castles = Castles.default();
          this.castles.discardColor("white");
          this.epSquare = void 0;
          this.remainingChecks = void 0;
          this.halfmoves = 0;
          this.fullmoves = 1;
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (this.board.king.size() !== 1)
            return n.err(new PositionError(IllegalSetup.Kings));
          const otherKing = this.board.kingOf(opposite(this.turn));
          if (defined(otherKing) && this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
          }
          for (const color of COLORS) {
            const backranks = this.board.pieces(color, "king").isEmpty() ? SquareSet.backrank(opposite(color)) : SquareSet.backranks();
            if (this.board.pieces(color, "pawn").intersects(backranks)) {
              return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
            }
          }
          return n.ok(void 0);
        }
        hasInsufficientMaterial(color) {
          if (this.board.pieces(color, "king").nonEmpty())
            return false;
          const oppositeSquareColor = (squareColor) => squareColor === "light" ? "dark" : "light";
          const coloredSquares = (squareColor) => squareColor === "light" ? SquareSet.lightSquares() : SquareSet.darkSquares();
          const hasBishopPair = (side) => {
            const bishops = this.board.pieces(side, "bishop");
            return bishops.intersects(SquareSet.darkSquares()) && bishops.intersects(SquareSet.lightSquares());
          };
          const horde = MaterialSide.fromBoard(this.board, color);
          const hordeBishops = (squareColor) => coloredSquares(squareColor).intersect(this.board.pieces(color, "bishop")).size();
          const hordeBishopColor = hordeBishops("light") >= 1 ? "light" : "dark";
          const hordeNum = horde.pawn + horde.knight + horde.rook + horde.queen + Math.min(hordeBishops("dark"), 2) + Math.min(hordeBishops("light"), 2);
          const pieces = MaterialSide.fromBoard(this.board, opposite(color));
          const piecesBishops = (squareColor) => coloredSquares(squareColor).intersect(this.board.pieces(opposite(color), "bishop")).size();
          const piecesNum = pieces.size();
          const piecesOfRoleNot = (piece) => piecesNum - piece;
          if (hordeNum === 0)
            return true;
          if (hordeNum >= 4) {
            return false;
          }
          if ((horde.pawn >= 1 || horde.queen >= 1) && hordeNum >= 2) {
            return false;
          }
          if (horde.rook >= 1 && hordeNum >= 2) {
            if (!(hordeNum === 2 && horde.rook === 1 && horde.bishop === 1 && piecesOfRoleNot(piecesBishops(hordeBishopColor)) === 1)) {
              return false;
            }
          }
          if (hordeNum === 1) {
            if (piecesNum === 1) {
              return true;
            } else if (horde.queen === 1) {
              return !(pieces.pawn >= 1 || pieces.rook >= 1 || piecesBishops("light") >= 2 || piecesBishops("dark") >= 2);
            } else if (horde.pawn === 1) {
              const pawnSquare = this.board.pieces(color, "pawn").last();
              const promoteToQueen = this.clone();
              promoteToQueen.board.set(pawnSquare, { color, role: "queen" });
              const promoteToKnight = this.clone();
              promoteToKnight.board.set(pawnSquare, { color, role: "knight" });
              return promoteToQueen.hasInsufficientMaterial(color) && promoteToKnight.hasInsufficientMaterial(color);
            } else if (horde.rook === 1) {
              return !(pieces.pawn >= 2 || pieces.rook >= 1 && pieces.pawn >= 1 || pieces.rook >= 1 && pieces.knight >= 1 || pieces.pawn >= 1 && pieces.knight >= 1);
            } else if (horde.bishop === 1) {
              return !// The king can be mated on A1 if there is a pawn/opposite-color-bishop
              // on A2 and an opposite-color-bishop on B1.
              // If black has two or more pawns, white gets the benefit of the doubt;
              // there is an outside chance that white promotes its pawns to
              // opposite-color-bishops and selfmates theirself.
              // Every other case that the king is mated by the bishop requires that
              // black has two pawns or two opposite-color-bishop or a pawn and an
              // opposite-color-bishop.
              // For example a king on A3 can be mated if there is
              // a pawn/opposite-color-bishop on A4, a pawn/opposite-color-bishop on
              // B3, a pawn/bishop/rook/queen on A2 and any other piece on B2.
              (piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.pawn >= 1 || pieces.pawn >= 2);
            } else if (horde.knight === 1) {
              return !// The king on A1 can be smother mated by a knight on C2 if there is
              // a pawn/knight/bishop on B2, a knight/rook on B1 and any other piece
              // on A2.
              // Moreover, when black has four or more pieces and two of them are
              // pawns, black can promote their pawns and selfmate theirself.
              (piecesNum >= 4 && (pieces.knight >= 2 || pieces.pawn >= 2 || pieces.rook >= 1 && pieces.knight >= 1 || pieces.rook >= 1 && pieces.bishop >= 1 || pieces.knight >= 1 && pieces.bishop >= 1 || pieces.rook >= 1 && pieces.pawn >= 1 || pieces.knight >= 1 && pieces.pawn >= 1 || pieces.bishop >= 1 && pieces.pawn >= 1 || hasBishopPair(opposite(color)) && pieces.pawn >= 1) && (piecesBishops("dark") < 2 || piecesOfRoleNot(piecesBishops("dark")) >= 3) && (piecesBishops("light") < 2 || piecesOfRoleNot(piecesBishops("light")) >= 3));
            }
          } else if (hordeNum === 2) {
            if (piecesNum === 1) {
              return true;
            } else if (horde.knight === 2) {
              return pieces.pawn + pieces.bishop + pieces.knight < 1;
            } else if (hasBishopPair(color)) {
              return !// A king on A1 obstructed by a pawn/bishop on A2 is mated
              // by the bishop pair.
              (pieces.pawn >= 1 || pieces.bishop >= 1 || pieces.knight >= 1 && pieces.rook + pieces.queen >= 1);
            } else if (horde.bishop >= 1 && horde.knight >= 1) {
              return !// A king on A1 obstructed by a pawn/opposite-color-bishop on
              // A2 is mated by a knight on D2 and a bishop on C3.
              (pieces.pawn >= 1 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 || piecesOfRoleNot(piecesBishops(hordeBishopColor)) >= 3);
            } else {
              return !// A king on A1 obstructed by a pawn/opposite-bishop/knight
              // on A2 and a opposite-bishop/knight on B1 is mated by two
              // bishops on B2 and C3. This position is theoretically
              // achievable even when black has two pawns or when they
              // have a pawn and an opposite color bishop.
              (pieces.pawn >= 1 && piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 || pieces.pawn >= 1 && pieces.knight >= 1 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.knight >= 1 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2 || pieces.knight >= 2 || pieces.pawn >= 2);
            }
          } else if (hordeNum === 3) {
            if (horde.knight === 2 && horde.bishop === 1 || horde.knight === 3 || hasBishopPair(color)) {
              return false;
            } else {
              return piecesNum === 1;
            }
          }
          return true;
        }
        isVariantEnd() {
          return this.board.white.isEmpty() || this.board.black.isEmpty();
        }
        variantOutcome(_ctx) {
          if (this.board.white.isEmpty())
            return { winner: "black" };
          if (this.board.black.isEmpty())
            return { winner: "white" };
          return;
        }
      };
      defaultPosition = (rules) => {
        switch (rules) {
          case "chess":
            return Chess.default();
          case "antichess":
            return Antichess.default();
          case "atomic":
            return Atomic.default();
          case "horde":
            return Horde.default();
          case "racingkings":
            return RacingKings.default();
          case "kingofthehill":
            return KingOfTheHill.default();
          case "3check":
            return ThreeCheck.default();
          case "crazyhouse":
            return Crazyhouse.default();
        }
      };
      setupPosition = (rules, setup) => {
        switch (rules) {
          case "chess":
            return Chess.fromSetup(setup);
          case "antichess":
            return Antichess.fromSetup(setup);
          case "atomic":
            return Atomic.fromSetup(setup);
          case "horde":
            return Horde.fromSetup(setup);
          case "racingkings":
            return RacingKings.fromSetup(setup);
          case "kingofthehill":
            return KingOfTheHill.fromSetup(setup);
          case "3check":
            return ThreeCheck.fromSetup(setup);
          case "crazyhouse":
            return Crazyhouse.fromSetup(setup);
        }
      };
    }
  });

  // node_modules/chessops/dist/esm/pgn.js
  var pgn_exports = {};
  __export(pgn_exports, {
    Box: () => Box,
    ChildNode: () => ChildNode,
    Node: () => Node2,
    PgnError: () => PgnError,
    PgnParser: () => PgnParser,
    defaultGame: () => defaultGame,
    defaultHeaders: () => defaultHeaders,
    emptyHeaders: () => emptyHeaders,
    extend: () => extend,
    isChildNode: () => isChildNode,
    isMate: () => isMate,
    isPawns: () => isPawns,
    makeComment: () => makeComment,
    makeOutcome: () => makeOutcome,
    makePgn: () => makePgn,
    makeVariant: () => makeVariant,
    parseComment: () => parseComment,
    parseOutcome: () => parseOutcome,
    parsePgn: () => parsePgn,
    parseVariant: () => parseVariant,
    setStartingPosition: () => setStartingPosition,
    startingPosition: () => startingPosition,
    transform: () => transform,
    walk: () => walk
  });
  function parseCommentShapeColor(str) {
    switch (str) {
      case "G":
        return "green";
      case "R":
        return "red";
      case "Y":
        return "yellow";
      case "B":
        return "blue";
      default:
        return;
    }
  }
  var defaultGame, Node2, ChildNode, isChildNode, extend, Box, transform, walk, makeOutcome, parseOutcome, escapeHeader, safeComment, makePgn, defaultHeaders, emptyHeaders, BOM, isWhitespace, isCommentLine, PgnError, PgnParser, parsePgn, parseVariant, makeVariant, startingPosition, setStartingPosition, isPawns, isMate, makeClk, makeCommentShapeColor, makeCommentShape, parseCommentShape, makeEval, makeComment, parseComment;
  var init_pgn = __esm({
    "node_modules/chessops/dist/esm/pgn.js"() {
      init_index_modern();
      init_chess();
      init_fen();
      init_util();
      init_variant();
      defaultGame = (initHeaders = defaultHeaders) => ({
        headers: initHeaders(),
        moves: new Node2()
      });
      Node2 = class {
        constructor() {
          this.children = [];
        }
        *mainlineNodes() {
          let node = this;
          while (node.children.length) {
            const child = node.children[0];
            yield child;
            node = child;
          }
        }
        *mainline() {
          for (const child of this.mainlineNodes())
            yield child.data;
        }
        end() {
          let node = this;
          while (node.children.length)
            node = node.children[0];
          return node;
        }
      };
      ChildNode = class extends Node2 {
        constructor(data) {
          super();
          this.data = data;
        }
      };
      isChildNode = (node) => node instanceof ChildNode;
      extend = (node, data) => {
        for (const d of data) {
          const child = new ChildNode(d);
          node.children.push(child);
          node = child;
        }
        return node;
      };
      Box = class _Box {
        constructor(value) {
          this.value = value;
        }
        clone() {
          return new _Box(this.value);
        }
      };
      transform = (node, ctx, f) => {
        const root = new Node2();
        const stack = [
          {
            before: node,
            after: root,
            ctx
          }
        ];
        let frame;
        while (frame = stack.pop()) {
          for (let childIndex = 0; childIndex < frame.before.children.length; childIndex++) {
            const ctx2 = childIndex < frame.before.children.length - 1 ? frame.ctx.clone() : frame.ctx;
            const childBefore = frame.before.children[childIndex];
            const data = f(ctx2, childBefore.data, childIndex);
            if (defined(data)) {
              const childAfter = new ChildNode(data);
              frame.after.children.push(childAfter);
              stack.push({
                before: childBefore,
                after: childAfter,
                ctx: ctx2
              });
            }
          }
        }
        return root;
      };
      walk = (node, ctx, f) => {
        const stack = [{ node, ctx }];
        let frame;
        while (frame = stack.pop()) {
          for (let childIndex = 0; childIndex < frame.node.children.length; childIndex++) {
            const ctx2 = childIndex < frame.node.children.length - 1 ? frame.ctx.clone() : frame.ctx;
            const child = frame.node.children[childIndex];
            if (f(ctx2, child.data, childIndex) !== false)
              stack.push({ node: child, ctx: ctx2 });
          }
        }
      };
      makeOutcome = (outcome) => {
        if (!outcome)
          return "*";
        else if (outcome.winner === "white")
          return "1-0";
        else if (outcome.winner === "black")
          return "0-1";
        else
          return "1/2-1/2";
      };
      parseOutcome = (s) => {
        if (s === "1-0" || s === "1–0" || s === "1—0")
          return { winner: "white" };
        else if (s === "0-1" || s === "0–1" || s === "0—1")
          return { winner: "black" };
        else if (s === "1/2-1/2" || s === "1/2–1/2" || s === "1/2—1/2")
          return { winner: void 0 };
        else
          return;
      };
      escapeHeader = (value) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      safeComment = (comment) => comment.replace(/\}/g, "");
      makePgn = (game) => {
        const builder = [], tokens = [];
        if (game.headers.size) {
          for (const [key, value] of game.headers.entries()) {
            builder.push("[", key, ' "', escapeHeader(value), '"]\n');
          }
          builder.push("\n");
        }
        for (const comment of game.comments || [])
          tokens.push("{", safeComment(comment), "}");
        const fen = game.headers.get("FEN");
        const initialPly = fen ? parseFen(fen).unwrap((setup) => (setup.fullmoves - 1) * 2 + (setup.turn === "white" ? 0 : 1), (_) => 0) : 0;
        const stack = [];
        const variations = game.moves.children[Symbol.iterator]();
        const firstVariation = variations.next();
        if (!firstVariation.done) {
          stack.push({
            state: 0,
            ply: initialPly,
            node: firstVariation.value,
            sidelines: variations,
            startsVariation: false,
            inVariation: false
          });
        }
        let forceMoveNumber = true;
        while (stack.length) {
          const frame = stack[stack.length - 1];
          if (frame.inVariation) {
            tokens.push(")");
            frame.inVariation = false;
            forceMoveNumber = true;
          }
          switch (frame.state) {
            case 0:
              for (const comment of frame.node.data.startingComments || []) {
                tokens.push("{", safeComment(comment), "}");
                forceMoveNumber = true;
              }
              if (forceMoveNumber || frame.ply % 2 === 0) {
                tokens.push(Math.floor(frame.ply / 2) + 1 + (frame.ply % 2 ? "..." : "."));
                forceMoveNumber = false;
              }
              tokens.push(frame.node.data.san);
              for (const nag of frame.node.data.nags || []) {
                tokens.push("$" + nag);
                forceMoveNumber = true;
              }
              for (const comment of frame.node.data.comments || []) {
                tokens.push("{", safeComment(comment), "}");
              }
              frame.state = 1;
            case 1: {
              const child = frame.sidelines.next();
              if (child.done) {
                const variations2 = frame.node.children[Symbol.iterator]();
                const firstVariation2 = variations2.next();
                if (!firstVariation2.done) {
                  stack.push({
                    state: 0,
                    ply: frame.ply + 1,
                    node: firstVariation2.value,
                    sidelines: variations2,
                    startsVariation: false,
                    inVariation: false
                  });
                }
                frame.state = 2;
              } else {
                tokens.push("(");
                forceMoveNumber = true;
                stack.push({
                  state: 0,
                  ply: frame.ply,
                  node: child.value,
                  sidelines: [][Symbol.iterator](),
                  startsVariation: true,
                  inVariation: false
                });
                frame.inVariation = true;
              }
              break;
            }
            case 2:
              stack.pop();
          }
        }
        tokens.push(makeOutcome(parseOutcome(game.headers.get("Result"))));
        builder.push(tokens.join(" "), "\n");
        return builder.join("");
      };
      defaultHeaders = () => /* @__PURE__ */ new Map([
        ["Event", "?"],
        ["Site", "?"],
        ["Date", "????.??.??"],
        ["Round", "?"],
        ["White", "?"],
        ["Black", "?"],
        ["Result", "*"]
      ]);
      emptyHeaders = () => /* @__PURE__ */ new Map();
      BOM = "\uFEFF";
      isWhitespace = (line) => /^\s*$/.test(line);
      isCommentLine = (line) => line.startsWith("%");
      PgnError = class extends Error {
      };
      PgnParser = class {
        constructor(emitGame, initHeaders = defaultHeaders, maxBudget = 1e6) {
          this.emitGame = emitGame;
          this.initHeaders = initHeaders;
          this.maxBudget = maxBudget;
          this.lineBuf = [];
          this.resetGame();
          this.state = 0;
        }
        resetGame() {
          this.budget = this.maxBudget;
          this.found = false;
          this.state = 1;
          this.game = defaultGame(this.initHeaders);
          this.stack = [{ parent: this.game.moves, root: true }];
          this.commentBuf = [];
        }
        consumeBudget(cost) {
          this.budget -= cost;
          if (this.budget < 0)
            throw new PgnError("ERR_PGN_BUDGET");
        }
        parse(data, options) {
          if (this.budget < 0)
            return;
          try {
            let idx = 0;
            for (; ; ) {
              const nlIdx = data.indexOf("\n", idx);
              if (nlIdx === -1) {
                break;
              }
              const crIdx = nlIdx > idx && data[nlIdx - 1] === "\r" ? nlIdx - 1 : nlIdx;
              this.consumeBudget(nlIdx - idx);
              this.lineBuf.push(data.slice(idx, crIdx));
              idx = nlIdx + 1;
              this.handleLine();
            }
            this.consumeBudget(data.length - idx);
            this.lineBuf.push(data.slice(idx));
            if (!(options === null || options === void 0 ? void 0 : options.stream)) {
              this.handleLine();
              this.emit(void 0);
            }
          } catch (err) {
            this.emit(err);
          }
        }
        handleLine() {
          let freshLine = true;
          let line = this.lineBuf.join("");
          this.lineBuf = [];
          continuedLine: for (; ; ) {
            switch (this.state) {
              case 0:
                if (line.startsWith(BOM))
                  line = line.slice(BOM.length);
                this.state = 1;
              case 1:
                if (isWhitespace(line) || isCommentLine(line))
                  return;
                this.found = true;
                this.state = 2;
              case 2: {
                if (isCommentLine(line))
                  return;
                let moreHeaders = true;
                while (moreHeaders) {
                  moreHeaders = false;
                  line = line.replace(/^\s*\[([A-Za-z0-9][A-Za-z0-9_+#=:-]*)\s+"((?:[^"\\]|\\"|\\\\)*)"\]/, (_match, headerName, headerValue) => {
                    this.consumeBudget(200);
                    this.handleHeader(headerName, headerValue.replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
                    moreHeaders = true;
                    freshLine = false;
                    return "";
                  });
                }
                if (isWhitespace(line))
                  return;
                this.state = 3;
              }
              case 3: {
                if (freshLine) {
                  if (isCommentLine(line))
                    return;
                  if (isWhitespace(line))
                    return this.emit(void 0);
                }
                const tokenRegex = /(?:[NBKRQ]?[a-h]?[1-8]?[-x]?[a-h][1-8](?:=?[nbrqkNBRQK])?|[pnbrqkPNBRQK]?@[a-h][1-8]|[O0o][-–—][O0o](?:[-–—][O0o])?)[+#]?|--|Z0|0000|@@@@|{|;|\$\d{1,4}|[?!]{1,2}|\(|\)|\*|1[-–—]0|0[-–—]1|1\/2[-–—]1\/2/g;
                let match;
                while (match = tokenRegex.exec(line)) {
                  const frame = this.stack[this.stack.length - 1];
                  let token = match[0];
                  if (token === ";")
                    return;
                  else if (token.startsWith("$"))
                    this.handleNag(parseInt(token.slice(1), 10));
                  else if (token === "!")
                    this.handleNag(1);
                  else if (token === "?")
                    this.handleNag(2);
                  else if (token === "!!")
                    this.handleNag(3);
                  else if (token === "??")
                    this.handleNag(4);
                  else if (token === "!?")
                    this.handleNag(5);
                  else if (token === "?!")
                    this.handleNag(6);
                  else if (token === "1-0" || token === "1–0" || token === "1—0" || token === "0-1" || token === "0–1" || token === "0—1" || token === "1/2-1/2" || token === "1/2–1/2" || token === "1/2—1/2" || token === "*") {
                    if (this.stack.length === 1 && token !== "*")
                      this.handleHeader("Result", token);
                  } else if (token === "(") {
                    this.consumeBudget(100);
                    this.stack.push({ parent: frame.parent, root: false });
                  } else if (token === ")") {
                    if (this.stack.length > 1)
                      this.stack.pop();
                  } else if (token === "{") {
                    const openIndex = tokenRegex.lastIndex;
                    const beginIndex = line[openIndex] === " " ? openIndex + 1 : openIndex;
                    line = line.slice(beginIndex);
                    this.state = 4;
                    continue continuedLine;
                  } else {
                    this.consumeBudget(100);
                    if (token.startsWith("O") || token.startsWith("0") || token.startsWith("o")) {
                      token = token.replace(/[0o]/g, "O").replace(/[–—]/g, "-");
                    } else if (token === "Z0" || token === "0000" || token === "@@@@")
                      token = "--";
                    if (frame.node)
                      frame.parent = frame.node;
                    frame.node = new ChildNode({
                      san: token,
                      startingComments: frame.startingComments
                    });
                    frame.startingComments = void 0;
                    frame.root = false;
                    frame.parent.children.push(frame.node);
                  }
                }
                return;
              }
              case 4: {
                const closeIndex = line.indexOf("}");
                if (closeIndex === -1) {
                  this.commentBuf.push(line);
                  return;
                } else {
                  const endIndex = closeIndex > 0 && line[closeIndex - 1] === " " ? closeIndex - 1 : closeIndex;
                  this.commentBuf.push(line.slice(0, endIndex));
                  this.handleComment();
                  line = line.slice(closeIndex);
                  this.state = 3;
                  freshLine = false;
                }
              }
            }
          }
        }
        handleHeader(name, value) {
          this.game.headers.set(name, name === "Result" ? makeOutcome(parseOutcome(value)) : value);
        }
        handleNag(nag) {
          var _a;
          this.consumeBudget(50);
          const frame = this.stack[this.stack.length - 1];
          if (frame.node) {
            (_a = frame.node.data).nags || (_a.nags = []);
            frame.node.data.nags.push(nag);
          }
        }
        handleComment() {
          var _a, _b;
          this.consumeBudget(100);
          const frame = this.stack[this.stack.length - 1];
          const comment = this.commentBuf.join("\n");
          this.commentBuf = [];
          if (frame.node) {
            (_a = frame.node.data).comments || (_a.comments = []);
            frame.node.data.comments.push(comment);
          } else if (frame.root) {
            (_b = this.game).comments || (_b.comments = []);
            this.game.comments.push(comment);
          } else {
            frame.startingComments || (frame.startingComments = []);
            frame.startingComments.push(comment);
          }
        }
        emit(err) {
          if (this.state === 4)
            this.handleComment();
          if (err)
            return this.emitGame(this.game, err);
          if (this.found)
            this.emitGame(this.game, void 0);
          this.resetGame();
        }
      };
      parsePgn = (pgn, initHeaders = defaultHeaders) => {
        const games = [];
        new PgnParser((game) => games.push(game), initHeaders, NaN).parse(pgn);
        return games;
      };
      parseVariant = (variant) => {
        switch ((variant || "chess").toLowerCase()) {
          case "chess":
          case "chess960":
          case "chess 960":
          case "standard":
          case "from position":
          case "classical":
          case "normal":
          case "fischerandom":
          case "fischerrandom":
          case "fischer random":
          case "wild/0":
          case "wild/1":
          case "wild/2":
          case "wild/3":
          case "wild/4":
          case "wild/5":
          case "wild/6":
          case "wild/7":
          case "wild/8":
          case "wild/8a":
            return "chess";
          case "crazyhouse":
          case "crazy house":
          case "house":
          case "zh":
            return "crazyhouse";
          case "king of the hill":
          case "koth":
          case "kingofthehill":
            return "kingofthehill";
          case "three-check":
          case "three check":
          case "threecheck":
          case "three check chess":
          case "3-check":
          case "3 check":
          case "3check":
            return "3check";
          case "antichess":
          case "anti chess":
          case "anti":
            return "antichess";
          case "atomic":
          case "atom":
          case "atomic chess":
            return "atomic";
          case "horde":
          case "horde chess":
            return "horde";
          case "racing kings":
          case "racingkings":
          case "racing":
          case "race":
            return "racingkings";
          default:
            return;
        }
      };
      makeVariant = (rules) => {
        switch (rules) {
          case "chess":
            return;
          case "crazyhouse":
            return "Crazyhouse";
          case "racingkings":
            return "Racing Kings";
          case "horde":
            return "Horde";
          case "atomic":
            return "Atomic";
          case "antichess":
            return "Antichess";
          case "3check":
            return "Three-check";
          case "kingofthehill":
            return "King of the Hill";
        }
      };
      startingPosition = (headers) => {
        const rules = parseVariant(headers.get("Variant"));
        if (!rules)
          return n.err(new PositionError(IllegalSetup.Variant));
        const fen = headers.get("FEN");
        if (fen)
          return parseFen(fen).chain((setup) => setupPosition(rules, setup));
        else
          return n.ok(defaultPosition(rules));
      };
      setStartingPosition = (headers, pos) => {
        const variant = makeVariant(pos.rules);
        if (variant)
          headers.set("Variant", variant);
        else
          headers.delete("Variant");
        const fen = makeFen(pos.toSetup());
        const defaultFen = makeFen(defaultPosition(pos.rules).toSetup());
        if (fen !== defaultFen)
          headers.set("FEN", fen);
        else
          headers.delete("FEN");
      };
      isPawns = (ev) => "pawns" in ev;
      isMate = (ev) => "mate" in ev;
      makeClk = (seconds) => {
        seconds = Math.max(0, seconds);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        seconds = seconds % 3600 % 60;
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toLocaleString("en", {
          minimumIntegerDigits: 2,
          maximumFractionDigits: 3
        })}`;
      };
      makeCommentShapeColor = (color) => {
        switch (color) {
          case "green":
            return "G";
          case "red":
            return "R";
          case "yellow":
            return "Y";
          case "blue":
            return "B";
        }
      };
      makeCommentShape = (shape) => shape.to === shape.from ? `${makeCommentShapeColor(shape.color)}${makeSquare(shape.to)}` : `${makeCommentShapeColor(shape.color)}${makeSquare(shape.from)}${makeSquare(shape.to)}`;
      parseCommentShape = (str) => {
        const color = parseCommentShapeColor(str.slice(0, 1));
        const from = parseSquare(str.slice(1, 3));
        const to = parseSquare(str.slice(3, 5));
        if (!color || !defined(from))
          return;
        if (str.length === 3)
          return { color, from, to: from };
        if (str.length === 5 && defined(to))
          return { color, from, to };
        return;
      };
      makeEval = (ev) => {
        const str = isMate(ev) ? "#" + ev.mate : ev.pawns.toFixed(2);
        return defined(ev.depth) ? str + "," + ev.depth : str;
      };
      makeComment = (comment) => {
        const builder = [];
        if (defined(comment.text))
          builder.push(comment.text);
        const circles = (comment.shapes || []).filter((shape) => shape.to === shape.from).map(makeCommentShape);
        if (circles.length)
          builder.push(`[%csl ${circles.join(",")}]`);
        const arrows = (comment.shapes || []).filter((shape) => shape.to !== shape.from).map(makeCommentShape);
        if (arrows.length)
          builder.push(`[%cal ${arrows.join(",")}]`);
        if (comment.evaluation)
          builder.push(`[%eval ${makeEval(comment.evaluation)}]`);
        if (defined(comment.emt))
          builder.push(`[%emt ${makeClk(comment.emt)}]`);
        if (defined(comment.clock))
          builder.push(`[%clk ${makeClk(comment.clock)}]`);
        return builder.join(" ");
      };
      parseComment = (comment) => {
        let emt, clock, evaluation;
        const shapes = [];
        const text = comment.replace(/\s?\[%(emt|clk)\s(\d{1,5}):(\d{1,2}):(\d{1,2}(?:\.\d{0,3})?)\]\s?/g, (_, annotation, hours, minutes, seconds) => {
          const value = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
          if (annotation === "emt")
            emt = value;
          else if (annotation === "clk")
            clock = value;
          return "  ";
        }).replace(/\s?\[%(?:csl|cal)\s([RGYB][a-h][1-8](?:[a-h][1-8])?(?:,[RGYB][a-h][1-8](?:[a-h][1-8])?)*)\]\s?/g, (_, arrows) => {
          for (const arrow of arrows.split(",")) {
            shapes.push(parseCommentShape(arrow));
          }
          return "  ";
        }).replace(/\s?\[%eval\s(?:#([+-]?\d{1,5})|([+-]?(?:\d{1,5}|\d{0,5}\.\d{1,2})))(?:,(\d{1,5}))?\]\s?/g, (_, mate, pawns, d) => {
          const depth = d && parseInt(d, 10);
          evaluation = mate ? { mate: parseInt(mate, 10), depth } : { pawns: parseFloat(pawns), depth };
          return "  ";
        }).trim();
        return {
          text,
          shapes,
          emt,
          clock,
          evaluation
        };
      };
    }
  });

  // node_modules/chessops/dist/esm/index.js
  var init_esm = __esm({
    "node_modules/chessops/dist/esm/index.js"() {
      init_chess();
      init_fen();
      init_san();
      init_pgn();
    }
  });

  // src/main/lichess-show-common-move/lichess-show-common-move.user.ts
  var require_lichess_show_common_move_user = __commonJS({
    "src/main/lichess-show-common-move/lichess-show-common-move.user.ts"(exports) {
      init_esm();
      var LichessShowCommonMove;
      ((LichessShowCommonMove2) => {
        let previousMoves = "";
        let observerCnt = 0;
        const observerOptions = {
          childList: true,
          subtree: true
        };
        const createMoveBlock = () => {
          var _a;
          const moveBlock = document.getElementById("common-move-block");
          if (moveBlock) {
            return moveBlock;
          }
          const parent = document.querySelector("div.material.material-bottom");
          if (parent) {
            const moveBlock2 = document.createElement("div");
            moveBlock2.id = "common-move-block";
            (_a = parent.parentElement) == null ? void 0 : _a.insertBefore(moveBlock2, parent.nextSibling);
            return moveBlock2;
          }
          console.error("Could not find parent element");
          return null;
        };
        const pgnToFen = (pgnString) => {
          try {
            const parsedPgn = pgn_exports.parsePgn(pgnString);
            const game = parsedPgn[0];
            const pos = Chess.default();
            Array.from(game.moves.mainline()).forEach((move) => {
              const parsed = san_exports.parseSan(pos, move.san);
              if (!parsed) {
                throw new Error(`Invalid move: ${move.san}`);
              }
              pos.play(parsed);
            });
            return fen_exports.makeFen(pos.toSetup());
          } catch (error) {
            throw new Error(`Error processing PGN: ${error}`);
          }
        };
        const handleResponse = (response, observer) => {
          const moveBlock = createMoveBlock();
          if (response.moves) {
            if (moveBlock) {
              moveBlock.innerHTML = `<div>Opening: ${response.opening}</div><div>Move: ${response.moves}</div>`;
            }
          } else {
            observer.disconnect();
            if (moveBlock) {
              moveBlock.innerHTML = `<div>No more known moves</div>`;
            }
          }
        };
        const getMoveList = (node, observer) => __async(exports, null, function* () {
          var _a, _b;
          const parentElement = node.parentElement;
          if (!parentElement) {
            console.log("Could not find parent element. Unexpected error");
            return;
          }
          let currentMoves = "";
          for (const item of Array.from(parentElement.children)) {
            if (item.nodeName == "I5Z") {
              currentMoves += `${item.textContent}.`;
            } else if (item.nodeName == "KWDB") {
              currentMoves += `${item.textContent} `;
            }
          }
          if (currentMoves === previousMoves) {
            return;
          }
          console.log(`Moves: ${currentMoves}`);
          const parsedToFen = pgnToFen(currentMoves.trim());
          console.log(`Parsed Moves: ${parsedToFen}`);
          let cachedMoves = window.localStorage.getItem(parsedToFen);
          if (!cachedMoves) {
            const response = yield GM.xmlHttpRequest({
              method: "GET",
              url: `https://explorer.lichess.ovh/masters?fen=${parsedToFen}`,
              headers: {
                "Content-Type": "application/json"
              }
            });
            if (response.status === 200) {
              const parsedResponse = JSON.parse(response.responseText);
              const storedObject = {
                opening: (_b = (_a = parsedResponse.opening) == null ? void 0 : _a.name) != null ? _b : "Unknown",
                moves: parsedResponse.moves.length > 0 ? parsedResponse.moves[0].uci : ""
              };
              const value = JSON.stringify(storedObject);
              console.log(`Stored Key-Value pair: Key:${parsedToFen}; Value:${value}`);
              window.localStorage.setItem(parsedToFen, value);
              cachedMoves = value;
            } else {
              console.error(`Error fetching moves: ${response.statusText}`);
            }
          }
          if (cachedMoves) {
            const movesObject = JSON.parse(cachedMoves);
            handleResponse(movesObject, observer);
          } else {
            console.error("No moves to handle");
          }
          previousMoves = currentMoves;
        });
        const getMovesDiv = (element) => {
          observerCnt++;
          return element.querySelector("rm6, l4x") ? element : null;
        };
        const getMoves = (records, observer) => {
          for (const record of records) {
            for (const item of Array.from(record.addedNodes)) {
              if (item.nodeType === Node.ELEMENT_NODE) {
                getMoveList(item, observer);
              }
            }
          }
        };
        const findNode = (records, observer) => {
          for (const record of records) {
            for (const item of Array.from(record.addedNodes)) {
              if (item.nodeType == Node.ELEMENT_NODE) {
                const retNode = getMovesDiv(item);
                if (retNode) {
                  observer.disconnect();
                  const movesObserver = new MutationObserver(getMoves);
                  movesObserver.observe(retNode, observerOptions);
                  break;
                } else if (observerCnt > 75) {
                  observer.disconnect();
                  break;
                }
              }
            }
          }
        };
        LichessShowCommonMove2.main = () => {
          const observer = new MutationObserver(findNode);
          observer.observe(document.body, observerOptions);
        };
      })(LichessShowCommonMove || (LichessShowCommonMove = {}));
      LichessShowCommonMove.main();
    }
  });
  require_lichess_show_common_move_user();
})();
//# sourceMappingURL=lichess-show-common-move.user.js.map
