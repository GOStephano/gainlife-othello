import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { executeStep as engineStep, initializeState } from "../lib/othello/core/engine"
import type { GameState, Position } from "../lib/othello/core/types"

export interface GameConfig {
	size: number
	variant?: "classic" | "corners" | "handicap"
}

const defaultConfig: GameConfig = { size: 8 }

const initialState: GameState = initializeState(defaultConfig)

const gameSlice = createSlice({
	name: "game",
	initialState,
	reducers: {
		newGame: {
			prepare(config?: Partial<GameConfig>) {
				return { payload: { ...defaultConfig, ...(config ?? {}) } as GameConfig }
			},
			reducer(_state, action: PayloadAction<GameConfig>) {
				return initializeState(action.payload)
			},
		},

		play(_state, action: PayloadAction<Position>) {
			return engineStep(_state, action.payload)
		},
	},
})

export const { newGame, play } = gameSlice.actions
export default gameSlice.reducer
