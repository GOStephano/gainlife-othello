import type { Position } from "@lib/othello/core/types"

export const DIRECTIONS: Position[] = [
	{ row: -1, column: -1 },
	{ row: -1, column: 0 },
	{ row: -1, column: 1 },
	{ row: 0, column: -1 },
	{ row: 0, column: 1 },
	{ row: 1, column: -1 },
	{ row: 1, column: 0 },
	{ row: 1, column: 1 },
]

export const CELL_STATE = {
	WHITE: "W",
	BLACK: "B",
	EMPTY: ".",
} as const

export const WINNING_COLOR = {
	WHITE: "W",
	BLACK: "B",
	TIE: "TIE",
} as const
