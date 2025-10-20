// features/ui/uiSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type Theme = "system" | "light" | "dark"

export interface Position {
	row: number
	column: number
}

export interface UiState {
	// Preferences
	showHints: boolean
	animations: boolean
	sound: boolean
	theme: Theme

	// View state (ephemeral)
	selectedCell: Position | null
	highlightLastMove: boolean
	confirmResignOpen: boolean
}

const initialState: UiState = {
	showHints: true, // purely visual; engine doesn’t care
	animations: true,
	sound: true,
	theme: "system",

	selectedCell: null,
	highlightLastMove: true,
	confirmResignOpen: false,
}

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		// Preferences
		toggleShowHints(s) {
			s.showHints = !s.showHints
		},
		setShowHints(s, a: PayloadAction<boolean>) {
			s.showHints = a.payload
		},

		toggleAnimations(s) {
			s.animations = !s.animations
		},
		setAnimations(s, a: PayloadAction<boolean>) {
			s.animations = a.payload
		},

		toggleSound(s) {
			s.sound = !s.sound
		},
		setSound(s, a: PayloadAction<boolean>) {
			s.sound = a.payload
		},

		setTheme(s, a: PayloadAction<Theme>) {
			s.theme = a.payload
		},

		// View state
		setSelectedCell(s, a: PayloadAction<Position | null>) {
			s.selectedCell = a.payload
		},
		clearSelectedCell(s) {
			s.selectedCell = null
		},

		setHighlightLastMove(s, a: PayloadAction<boolean>) {
			s.highlightLastMove = a.payload
		},

		openConfirmResign(s) {
			s.confirmResignOpen = true
		},
		closeConfirmResign(s) {
			s.confirmResignOpen = false
		},

		// Optional: reset UI state when starting a new game
		resetUiState() {
			return initialState
		},
	},
})

export const {
	toggleShowHints,
	setShowHints,
	toggleAnimations,
	setAnimations,
	toggleSound,
	setSound,
	setTheme,
	setSelectedCell,
	clearSelectedCell,
	setHighlightLastMove,
	openConfirmResign,
	closeConfirmResign,
	resetUiState,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors (kept narrow so components don’t over-render)
export const selectShowHints = (s: { ui: UiState }) => s.ui.showHints
export const selectAnimations = (s: { ui: UiState }) => s.ui.animations
export const selectSound = (s: { ui: UiState }) => s.ui.sound
export const selectTheme = (s: { ui: UiState }) => s.ui.theme
export const selectSelectedCell = (s: { ui: UiState }) => s.ui.selectedCell
export const selectHighlightLastMove = (s: { ui: UiState }) => s.ui.highlightLastMove
export const selectConfirmResignOpen = (s: { ui: UiState }) => s.ui.confirmResignOpen
