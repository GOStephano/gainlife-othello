import { DIRECTIONS } from "./constants"
import type { Cell, Color, GameConfig, GameState, Position, Snapshot, Vector } from "./types"

export function initializeState(config: GameConfig): GameState {
	const size = config.size
	const board = createEmptyBoard(size)
	const mid = size / 2

	board[mid - 1][mid - 1] = "W"
	board[mid][mid] = "W"
	board[mid - 1][mid] = "B"
	board[mid][mid - 1] = "B"

	const turn: Color = "B"
	const legalMoves = getLegalMoves(board, turn)
	const { blackScore, whiteScore } = count(board)

	return {
		board,
		turn,
		legalMoves,
		blackScore,
		whiteScore,
		next: [],
		previous: [],
		finished: false,
	}
}

export function executeStep(state: GameState, pos: Position): GameState {
	console.log({ state })
	if (state.finished || !canPlay(state.board, pos, state.turn)) return state

	const board = applyMove(state.board, pos, state.turn)
	const nextTurnPlayer = nextTurn(board, state.turn)
	const finished = nextTurnPlayer === null
	const turn = finished ? state.turn : (nextTurnPlayer as Color)
	const legalMoves = finished ? [] : getLegalMoves(board, turn)
	const { blackScore, whiteScore } = count(board)

	const winner = finished ? getWinner(whiteScore, blackScore) : undefined

	const prevSnapshot = makeSnapshot(state)
	const previous = [...state.previous, prevSnapshot]
	const next: Snapshot[] = []

	return { board, turn, legalMoves, blackScore, whiteScore, finished, winner, previous, next }
}

export function getFlipped(board: Cell[][], pos: Position, color: Color): Position[] {
	if (board[pos.row][pos.column] !== ".") return []
	const flips: Position[] = []
	for (const d of DIRECTIONS) {
		const seg = getFlipsInDirection(board, pos, color, d)
		if (seg.length) flips.push(...seg)
	}
	return flips
}

export function undo(state: GameState): GameState {
	if (state.previous.length === 0) return state

	const target = state.previous[state.previous.length - 1]

	const redoSnapshot = makeSnapshot(state)
	const previous = state.previous.slice(0, -1)
	const next = [...state.next, redoSnapshot]

	return restoreFromSnapshot(target, previous, next)
}

export function redo(state: GameState): GameState {
	if (state.next.length === 0) return state

	const target = state.next[state.next.length - 1]

	const undoSnapshot = makeSnapshot(state)
	const previous = [...state.previous, undoSnapshot]
	const next = state.next.slice(0, -1)

	return restoreFromSnapshot(target, previous, next)
}

// private

function createEmptyBoard(size: number): Cell[][] {
	return Array.from({ length: size }, () => Array.from({ length: size }, () => "."))
}

function getLegalMoves(board: Cell[][], color: Color): Position[] {
	const moves: Position[] = []
	for (let row = 0; row < board.length; row++) {
		for (let column = 0; column < board.length; column++) {
			if (board[row][column] === "." && canPlay(board, { row, column }, color)) {
				moves.push({ row, column })
			}
		}
	}
	return moves
}

function canPlay(board: Cell[][], position: Position, color: Color): boolean {
	return getFlipped(board, position, color).length > 0
}

function getOpponentColor(color: Color): Color {
	return color === "B" ? "W" : "B"
}

function getFlipsInDirection(board: Cell[][], playedPosition: Position, color: Color, direction: Vector): Position[] {
	const flippedCells: Position[] = []
	let row = playedPosition.row + direction.row
	let column = playedPosition.column + direction.column

	if (!isInBounds(board, row, column) || board[row][column] !== getOpponentColor(color)) return []

	while (isInBounds(board, row, column) && board[row][column] === getOpponentColor(color)) {
		flippedCells.push({ row, column })
		row += direction.row
		column += direction.column
	}

	if (!isInBounds(board, row, column) || board[row][column] !== color) return []
	return flippedCells
}

function isInBounds(board: Cell[][], row: number, column: number) {
	return row >= 0 && column >= 0 && row < board.length && column < board.length
}

function applyMove(board: Cell[][], position: Position, color: Color): Cell[][] {
	const flips = getFlipped(board, position, color)
	if (flips.length === 0) return board

	const newBoard = cloneBoard(board)
	for (const cell of flips) newBoard[cell.row][cell.column] = color
	newBoard[position.row][position.column] = color
	return newBoard
}

function count(board: Cell[][]) {
	let blackScore = 0
	let whiteScore = 0

	for (const row of board) {
		for (const cell of row) {
			if (cell === "B") blackScore++
			else if (cell === "W") whiteScore++
		}
	}

	return { blackScore, whiteScore }
}

function nextTurn(board: Cell[][], currentPlayer: Color) {
	const otherPlayer = getOpponentColor(currentPlayer)
	const otherMoves = getLegalMoves(board, otherPlayer)
	if (otherMoves.length) return otherPlayer

	const curMoves = getLegalMoves(board, currentPlayer)
	if (curMoves.length) return currentPlayer

	//! game over (no legal moves for either player)
	return null
}

function getWinner(whiteScore: number, blackScore: number): Color | "TIE" {
	return blackScore === whiteScore ? "TIE" : blackScore > whiteScore ? "B" : "W"
}

// History helpers

function makeSnapshot(state: GameState): Snapshot {
	return {
		board: cloneBoard(state.board),
		turn: state.turn,
	}
}

function restoreFromSnapshot(snapshot: Snapshot, previous: Snapshot[], next: Snapshot[]): GameState {
	const board = cloneBoard(snapshot.board)
	const turn = snapshot.turn
	const legalMoves = getLegalMoves(board, turn)
	const { blackScore, whiteScore } = count(board)
	const finished = nextTurn(board, turn) === null
	const winner = finished ? getWinner(whiteScore, blackScore) : undefined

	return { board, turn, legalMoves, blackScore, whiteScore, finished, winner, previous, next }
}

function cloneBoard(board: Cell[][]): Cell[][] {
	return board.map((row) => row.slice())
}
