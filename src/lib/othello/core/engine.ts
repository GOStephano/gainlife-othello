type Position = {
	row: number
	column: number
}

type Vector = {
	row: number
	column: number
}

type Color = "W" | "B"
type Cell = Color | "."

interface GameConfig {
	size: number
	showHints: boolean
	variant?: "classic" | "corners" | "handicap"
}

interface GameState {
	board: Cell[][]
	turn: Color
	legalMoves: Position[]
	blackScore: number
	whiteScore: number
	finished: boolean
	winner?: Color | "TIE"
}

const DIRECTIONS: Position[] = [
	{ row: -1, column: -1 },
	{ row: -1, column: 0 },
	{ row: -1, column: 1 },
	{ row: 0, column: -1 },
	{ row: 0, column: 1 },
	{ row: 1, column: -1 },
	{ row: 1, column: 0 },
	{ row: 1, column: 1 },
]

export function initializeState(config: GameConfig): GameState {
	// Check if even
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
	return { board, turn, legalMoves, blackScore, whiteScore, finished: false }
}

export function step(state: GameState, pos: Position): GameState {
	if (state.finished || !canPlay(state.board, pos, state.turn)) return state

	const board = applyMove(state.board, pos, state.turn)
	const nextTurnPlayer = nextTurn(board, state.turn)
	const finished = nextTurnPlayer === null
	const turn = finished ? state.turn : (nextTurnPlayer as Color)
	const legalMoves = finished ? [] : getLegalMoves(board, turn)
	const { blackScore, whiteScore } = count(board)

	const winner = finished ? getWinner(state.whiteScore, state.blackScore) : undefined

	return { board, turn, legalMoves, blackScore, whiteScore, finished, winner }
}

function getOpponentColor(color: Color) {
	return color === "B" ? "B" : "W"
}

function isInBounds(board: Cell[][], row: number, column: number) {
	return row >= 0 && column >= 0 && row < board.length && column < board.length
}

function createEmptyBoard(size: number): Cell[][] {
	return Array.from({ length: size }, () => Array.from({ length: size }, () => "."))
}

function getLegalMoves(board: Cell[][], color: Color): Position[] {
	const moves: Position[] = []
	for (let row = 0; row < board.length; row++)
		for (let column = 0; column < board.length; column++)
			if (board[row][column] === "." && canPlay(board, { row, column }, color)) moves.push({ row, column })
	return moves
}

function canPlay(board: Cell[][], position: Position, color: Color): boolean {
	if (board[position.row][position.column] !== ".") return false
	return DIRECTIONS.some((d) => getFlipsInDirection(board, position, color, d).length > 0)
}

function getFlipsInDirection(board: Cell[][], playedPosition: Position, color: Color, direction: Vector): Position[] {
	const flippedCells: Position[] = []
	let row = playedPosition.row + direction.row,
		column = playedPosition.column + direction.column
	if (!isInBounds(board, row, column) || board[row][column] !== getOpponentColor(color)) return []
	while (isInBounds(board, row, column) && board[row][column] === getOpponentColor(color)) {
		flippedCells.push({ row, column })
		row += direction.row
		column += direction.column
	}
	if (!isInBounds(board, row, column) || board[row][column] !== color) return []
	return flippedCells
}

function applyMove(board: Cell[][], position: Position, color: Color): Cell[][] {
	const newBoard = board.map((row) => row.slice())
	let someFlipOccured = false

	for (const direction of DIRECTIONS) {
		const flips = getFlipsInDirection(board, position, color, direction)
		for (const flippedCell of flips) {
			newBoard[flippedCell.row][flippedCell.column] = color
			someFlipOccured = true
		}
	}

	if (someFlipOccured) newBoard[position.row][position.column] = color

	return newBoard
}

function count(board: Cell[][]) {
	let blackScore = 0
	let whiteScore = 0

	for (const row of board)
		for (const cell of row) {
			if (cell === "B") blackScore++
			if (cell === "W") whiteScore++
		}

	return { blackScore, whiteScore }
}

function nextTurn(board: Cell[][], currentPlayer: Color) {
	const otherPlayer = getOpponentColor(currentPlayer)
	const otherMoves = getLegalMoves(board, otherPlayer)
	if (otherMoves.length) return otherPlayer

	const curMoves = getLegalMoves(board, currentPlayer)
	if (curMoves.length) return currentPlayer

	return null // game over
}

function getWinner(whiteScore: number, blackScore: number) {
	const winner = blackScore === whiteScore ? "TIE" : blackScore > whiteScore ? "B" : "W"

	return winner
}
