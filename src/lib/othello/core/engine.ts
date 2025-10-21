import { CELL_STATE, DIRECTIONS, WINNING_COLOR } from "@lib/othello/core/constants"
import type { Board, Color, GameConfig, GameState, Position, Snapshot, Vector, WinningColor } from "@lib/othello/core/types"

export function initializeGameState(config: GameConfig): GameState {
	const boardSize = config.size
	const board = setDefaultDiscInBoard(createEmptyBoard(boardSize), boardSize)

	const turn: Color = CELL_STATE.BLACK
	const legalMoves = getLegalMoves(board, turn)
	const { blackScore, whiteScore } = countScore(board)

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

export function playPosition(state: GameState, position: Position): GameState {
	if (state.finished || !canPlay(state.board, position, state.turn)) return state

	const board = applyMove(state.board, position, state.turn)
	const nextTurnPlayer = nextTurn(board, state.turn)
	const finished = nextTurnPlayer === null
	const turn = finished ? state.turn : (nextTurnPlayer as Color)
	const legalMoves = finished ? [] : getLegalMoves(board, turn)
	const { blackScore, whiteScore } = countScore(board)

	const winner = finished ? getWinner(whiteScore, blackScore) : undefined

	const prevSnapshot = makeSnapshot(state)
	const previous = [...state.previous, prevSnapshot]
	const next: Snapshot[] = []

	return { board, turn, legalMoves, blackScore, whiteScore, finished, winner, previous, next }
}

export function getAllFlippedDisc(board: Board, pos: Position, color: Color): Position[] {
	if (board[pos.row][pos.column] !== CELL_STATE.EMPTY) return []

	const flips: Position[] = []

	for (const direction of DIRECTIONS) {
		const segment = getFlippedDiscsInDirection(board, pos, color, direction)
		if (segment.length) flips.push(...segment)
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

function setDefaultDiscInBoard(board: Board, boardSize: number) {
	const boardMidPoint = boardSize / 2

	board[boardMidPoint - 1][boardMidPoint - 1] = CELL_STATE.WHITE
	board[boardMidPoint][boardMidPoint] = CELL_STATE.WHITE
	board[boardMidPoint - 1][boardMidPoint] = CELL_STATE.BLACK
	board[boardMidPoint][boardMidPoint - 1] = CELL_STATE.BLACK

	return board
}

function createEmptyBoard(size: number): Board {
	return Array.from({ length: size }, () => Array.from({ length: size }, () => CELL_STATE.EMPTY))
}

function getLegalMoves(board: Board, color: Color): Position[] {
	const moves: Position[] = []
	for (let row = 0; row < board.length; row++) {
		for (let column = 0; column < board.length; column++) {
			if (board[row][column] === CELL_STATE.EMPTY && canPlay(board, { row, column }, color)) {
				moves.push({ row, column })
			}
		}
	}
	return moves
}

function canPlay(board: Board, position: Position, color: Color): boolean {
	return getAllFlippedDisc(board, position, color).length > 0
}

function getOpponentColor(color: Color): Color {
	return color === CELL_STATE.BLACK ? CELL_STATE.WHITE : CELL_STATE.BLACK
}

function getFlippedDiscsInDirection(board: Board, playedPosition: Position, color: Color, direction: Vector): Position[] {
	const flippedCells: Position[] = []
	const opponent = getOpponentColor(color)

	let row = playedPosition.row + direction.row
	let column = playedPosition.column + direction.column

	while (isInBounds(board, row, column) && board[row][column] === opponent) {
		flippedCells.push({ row, column })
		row += direction.row
		column += direction.column
	}

	if (!isInBounds(board, row, column) || board[row][column] !== color) return []

	return flippedCells
}

function isInBounds(board: Board, row: number, column: number) {
	return row >= 0 && column >= 0 && row < board.length && column < board.length
}

function applyMove(board: Board, position: Position, color: Color): Board {
	const flips = getAllFlippedDisc(board, position, color)
	if (flips.length === 0) return board

	const newBoard = cloneBoard(board)
	for (const cell of flips) newBoard[cell.row][cell.column] = color
	newBoard[position.row][position.column] = color
	return newBoard
}

function countScore(board: Board) {
	let blackScore = 0
	let whiteScore = 0

	for (const row of board) {
		for (const cell of row) {
			if (cell === CELL_STATE.BLACK) blackScore++
			else if (cell === CELL_STATE.WHITE) whiteScore++
		}
	}

	return { blackScore, whiteScore }
}

function nextTurn(board: Board, currentPlayer: Color) {
	const otherPlayer = getOpponentColor(currentPlayer)
	const otherMoves = getLegalMoves(board, otherPlayer)
	if (otherMoves.length) return otherPlayer

	const curMoves = getLegalMoves(board, currentPlayer)
	if (curMoves.length) return currentPlayer

	return null
}

function getWinner(whiteScore: number, blackScore: number): WinningColor {
	return blackScore === whiteScore ? WINNING_COLOR.TIE : blackScore > whiteScore ? WINNING_COLOR.BLACK : WINNING_COLOR.WHITE
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
	const { blackScore, whiteScore } = countScore(board)
	const finished = nextTurn(board, turn) === null
	const winner = finished ? getWinner(whiteScore, blackScore) : undefined

	return { board, turn, legalMoves, blackScore, whiteScore, finished, winner, previous, next }
}

function cloneBoard(board: Board): Board {
	return board.map((row) => row.slice())
}
