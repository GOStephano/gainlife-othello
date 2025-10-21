export type Position = {
	row: number
	column: number
}

export type Vector = {
	row: number
	column: number
}

export type Color = "W" | "B"
export type Cell = Color | "."

export type Snapshot = {
	board: Cell[][]
	turn: Color
}

export interface GameConfig {
	size: number
	variant?: "classic" | "corners" | "handicap"
}

export interface GameState {
	board: Cell[][]
	previous: Snapshot[]
	next: Snapshot[]
	turn: Color
	legalMoves: Position[]
	blackScore: number
	whiteScore: number
	finished: boolean
	winner?: Color | "TIE"
}
