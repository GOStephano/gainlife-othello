Lets work on the engine and game logic Transcribe the rules of the game into functions

Respect the following types:
type Position = { row: number; column: number; }; type Color = "W" | "B"; type Cell = Color | ".";
interface GameConfig { size: number; showHints: boolean; variant?: "classic" | "corners" | "handicap"; }
interface GameState { board: Cell[][]; turn: Color; legalMoves: Position[]; blackScore: number; whiteScore: number; finished: boolean; winner?: Color | "TIE"; }

types.ts

```ts
export type Player = "dark" | "light"
export type Cell = 0 | 1 | 2 // 0 empty, 1 dark, 2 light

export interface Move {
	row: number
	col: number
}

export interface GameOptions {
	size?: number // default 8
	// future: opening books, handicaps, corner bonuses, etc.
}

export interface GameState {
	size: number
	board: Cell[][]
	turn: Player
	legalMoves: Move[]
	dark: number
	light: number
	gameOver: boolean
}

/** Discriminated union for step actions */
export type GameAction = { type: "move"; move: Move } | { type: "pass" } | { type: "reset"; options?: GameOptions }
```

engine.ts

```ts
import type { Cell, GameAction, GameOptions, GameState, Move, Player } from "./types"

const DARK: Cell = 1
const LIGHT: Cell = 2
const EMPTY: Cell = 0

const DIRS: ReadonlyArray<[number, number]> = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1],
]

export const other = (p: Player): Player => (p === "dark" ? "light" : "dark")
const asCell = (p: Player): Cell => (p === "dark" ? DARK : LIGHT)

/** Create an empty board size×size. */
export function makeBoard(size: number): Cell[][] {
	return Array.from({ length: size }, () => Array<Cell>(size).fill(EMPTY))
}

/** Standard Othello initial layout. */
export function initBoard(size = 8): Cell[][] {
	if (size % 2 !== 0 || size < 4) throw new Error("Board size must be even and ≥ 4")
	const b = makeBoard(size)
	const m = size / 2
	b[m - 1][m - 1] = LIGHT
	b[m][m] = LIGHT
	b[m - 1][m] = DARK
	b[m][m - 1] = DARK
	return b
}

export function inBounds(size: number, r: number, c: number) {
	return r >= 0 && r < size && c >= 0 && c < size
}

export function score(board: Cell[][]) {
	let dark = 0,
		light = 0
	for (const row of board) {
		for (const cell of row) {
			if (cell === DARK) dark++
			else if (cell === LIGHT) light++
		}
	}
	return { dark, light }
}

/** Check whether move flips ≥1 line of enemy discs. */
export function isValidMove(board: Cell[][], player: Player, move: Move): boolean {
	const { row, col } = move
	const size = board.length
	if (!inBounds(size, row, col) || board[row][col] !== EMPTY) return false

	const me = asCell(player)
	const enemy = player === "dark" ? LIGHT : DARK

	for (const [dr, dc] of DIRS) {
		let r = row + dr,
			c = col + dc,
			seenEnemy = false
		while (inBounds(size, r, c) && board[r][c] === enemy) {
			seenEnemy = true
			r += dr
			c += dc
		}
		if (seenEnemy && inBounds(size, r, c) && board[r][c] === me) {
			return true
		}
	}
	return false
}

/** List all legal moves for player. */
export function deriveLegalMoves(board: Cell[][], player: Player): Move[] {
	const moves: Move[] = []
	for (let r = 0; r < board.length; r++) {
		for (let c = 0; c < board.length; c++) {
			if (isValidMove(board, player, { row: r, col: c })) moves.push({ row: r, col: c })
		}
	}
	return moves
}

/** Apply a legal move, flipping captured discs. Returns a *new* board. */
export function applyMove(board: Cell[][], player: Player, move: Move) {
	if (!isValidMove(board, player, move)) {
		return { board, flipped: 0, changed: false }
	}

	const size = board.length
	const me = asCell(player)
	const enemy = player === "dark" ? LIGHT : DARK

	const next = board.map((row) => row.slice())
	next[move.row][move.col] = me

	let flipped = 0

	for (const [dr, dc] of DIRS) {
		const path: Array<[number, number]> = []
		let r = move.row + dr,
			c = move.col + dc
		while (inBounds(size, r, c) && next[r][c] === enemy) {
			path.push([r, c])
			r += dr
			c += dc
		}
		if (path.length && inBounds(size, r, c) && next[r][c] === me) {
			for (const [pr, pc] of path) {
				next[pr][pc] = me
				flipped++
			}
		}
	}

	return { board: next, flipped, changed: true }
}

/** True when neither player has a move OR board is full. */
export function isTerminal(board: Cell[][]): boolean {
	const noEmpty = board.every((row) => row.every((c) => c !== EMPTY))
	if (noEmpty) return true
	const hasDark = deriveLegalMoves(board, "dark").length > 0
	const hasLight = deriveLegalMoves(board, "light").length > 0
	return !hasDark && !hasLight
}

/** Initialize a complete game state. */
export function initGame(options: GameOptions = {}): GameState {
	const size = options.size ?? 8
	const board = initBoard(size)
	const { dark, light } = score(board)
	const legalMoves = deriveLegalMoves(board, "dark")
	return {
		size,
		board,
		turn: "dark",
		legalMoves,
		dark,
		light,
		gameOver: isTerminal(board),
	}
}

/**
 * Single reducer-like step. Pure & immutable.
 * - 'move': apply move if legal; otherwise returns same state.
 * - 'pass': only allowed when no legal moves; switch turn.
 * - 'reset': new game with options.
 */
export function step(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case "reset":
			return initGame(action.options)

		case "pass": {
			// Pass allowed only if no legal moves
			if (state.legalMoves.length > 0 || state.gameOver) return state
			const nextTurn = other(state.turn)
			const legalMoves = deriveLegalMoves(state.board, nextTurn)
			const terminal = legalMoves.length === 0 && deriveLegalMoves(state.board, state.turn).length === 0
			return {
				...state,
				turn: nextTurn,
				legalMoves,
				gameOver: terminal || isTerminal(state.board),
			}
		}

		case "move": {
			if (!isValidMove(state.board, state.turn, action.move) || state.gameOver) {
				return state
			}
			const res = applyMove(state.board, state.turn, action.move)
			const { dark, light } = score(res.board)

			// Opponent turn
			const opp = other(state.turn)
			let legalMoves = deriveLegalMoves(res.board, opp)
			let nextTurn = opp

			// If opponent cannot move, current player goes again (pass enforced)
			if (legalMoves.length === 0) {
				legalMoves = deriveLegalMoves(res.board, state.turn)
				nextTurn = state.turn
			}

			const terminal = legalMoves.length === 0 && isTerminal(res.board)

			return {
				...state,
				board: res.board,
				dark,
				light,
				turn: nextTurn,
				legalMoves,
				gameOver: terminal,
			}
		}
	}
}
```

I've used some of the logic here, but it was disapointing. Most of the work i've done was on the 'executeNextStep' function
