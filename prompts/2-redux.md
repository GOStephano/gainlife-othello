Create a Redux Toolkit slice:

Use functions from lib/othello/engine for core logic (step, count, getLegalMoves, etc.)
Keep game history (past, present, future) for undo/redo
Support conf opts size
Include simple AI settings (enabled, color, delay, strategy, profile)
Include reducers for playing moves, undo/redo, toggling hints, and AI configuration
Include the redux store configuration with its exports

> -------------RESPONSE-------------<

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { count, getLegalMoves, initialState as init, nextTurn, step } from "../../lib/othello/engine"
import type { AiProfile } from "../../lib/othello/types"
import type { GameConfig, GameWithHistory, Pos } from "./types"

type AiStrategy = "greedy"

interface AiSettings {
	enabled: boolean
	color: "B" | "W"
	delayMs: number
	strategy?: "greedy"
	profile?: AiProfile
}
const defaultConfig: GameConfig = { size: 8, showHints: true, variant: "classic" }

const defaultAi: AiSettings = {
	enabled: false,
	color: "W",
	delayMs: 200,
	strategy: "greedy",
	profile: undefined,
}

const initial: GameWithHistory & { ai: AiSettings } = {
	present: init(defaultConfig),
	past: [],
	future: [],
	config: defaultConfig,
	ai: defaultAi,
}

const slice = createSlice({
	name: "game",
	initialState: initial,
	reducers: {
		newGame(s, a: PayloadAction<Partial<GameConfig> | undefined>) {
			s.config = { ...s.config, ...(a.payload ?? {}) }
			s.present = init(s.config)
			s.past = []
			s.future = []
		},
		play(s, a: PayloadAction<Pos>) {
			const next = step(s.present, a.payload)
			if (next !== s.present) {
				s.past.push(s.present)
				s.present = next
				s.future = []
			}
		},
		undo(s) {
			const prev = s.past.pop()
			if (prev) {
				s.future.unshift(s.present)
				s.present = prev
			}
		},
		redo(s) {
			const nxt = s.future.shift()
			if (nxt) {
				s.past.push(s.present)
				s.present = nxt
			}
		},
		toggleHints(s) {
			s.config.showHints = !s.config.showHints
		},

		// AI control
		setAiEnabled(s, a: PayloadAction<boolean>) {
			s.ai.enabled = a.payload
		},
		setAiColor(s, a: PayloadAction<"B" | "W">) {
			s.ai.color = a.payload
		},
		setAiDelay(s, a: PayloadAction<number>) {
			s.ai.delayMs = a.payload
		},
		setAiStrategy(s, a: PayloadAction<AiStrategy>) {
			s.ai.strategy = a.payload
		},
		setAiProfile(s, a: PayloadAction<AiProfile | undefined>) {
			s.ai.profile = a.payload
		},

		passIfNoMoves(s) {
			if (s.present.finished) return
			if (s.present.legalMoves.length > 0) return

			const nextT = nextTurn(s.present.board, s.present.turn)
			if (nextT === null) {
				const { blackScore, whiteScore } = count(s.present.board)
				s.present = { ...s.present, finished: true, winner: blackScore === whiteScore ? "TIE" : blackScore > whiteScore ? "B" : "W" }
				return
			}
			const legalMoves = getLegalMoves(s.present.board, nextT)
			const { blackScore, whiteScore } = count(s.present.board)
			s.past.push(s.present)
			s.present = { ...s.present, turn: nextT, legalMoves, blackScore, whiteScore }
			s.future = []
		},
	},
})

export const { newGame, play, undo, redo, toggleHints, setAiEnabled, setAiColor, setAiDelay, setAiStrategy, passIfNoMoves, setAiProfile } =
	slice.actions

export default slice.reducer
```

```ts
import { configureStore } from "@reduxjs/toolkit"
import game from "../features/game/gameSlice"

export const store = configureStore({ reducer: { game } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```
