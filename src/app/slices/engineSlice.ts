import { redo as engineRedo, playPosition as engineStep, undo as engineUndo, initializeGameState } from "@lib/othello/core/engine"
import type { GameState, Position } from "@lib/othello/core/types"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface GameConfig {
	size: number
	variant?: "classic" | "corners" | "handicap"
}

const defaultConfig: GameConfig = { size: 8 }

const initialState: GameState = initializeGameState(defaultConfig)

const gameSlice = createSlice({
	name: "game",
	initialState,
	reducers: {
		newGame: {
			prepare(config?: Partial<GameConfig>) {
				return { payload: { ...defaultConfig, ...(config ?? {}) } as GameConfig }
			},
			reducer(_state, action: PayloadAction<GameConfig>) {
				return initializeGameState(action.payload)
			},
		},

		play(_state, action: PayloadAction<Position>) {
			return engineStep(_state, action.payload)
		},

		undo(_state) {
			return engineUndo(_state)
		},

		redo(_state) {
			return engineRedo(_state)
		},
	},
})

export const { newGame, play, undo, redo } = gameSlice.actions
export default gameSlice.reducer
