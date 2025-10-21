import type { CELL_STATE, WINNING_COLOR } from "@lib/othello/core/constants"

export type Position = {
	row: number
	column: number
}

export type Vector = {
	row: number
	column: number
}

export type Cell = (typeof CELL_STATE)[keyof typeof CELL_STATE]

export type Color = Exclude<Cell, ".">

export type WinningColor = (typeof WINNING_COLOR)[keyof typeof WINNING_COLOR] | undefined

export type Snapshot = {
	board: Board
	turn: Color
}

export interface GameConfig {
	size: number
	variant?: "classic" | "corners" | "handicap"
}

export type Board = Cell[][]

export interface GameState {
	board: Board
	previous: Snapshot[]
	next: Snapshot[]
	turn: Color
	legalMoves: Position[]
	blackScore: number
	whiteScore: number
	finished: boolean
	winner?: Color | "TIE"
}
