import type { RootState } from "@app/store"
import { getFlipped as engineGetFlipped } from "@lib/othello/core/engine"
import type { Position } from "@lib/othello/core/types"
import { createSelector } from "@reduxjs/toolkit"

export const selectBoard = (s: RootState) => s.game.board
export const selectLegalMoves = (s: RootState) => s.game.legalMoves
export const selectTurn = (s: RootState) => s.game.turn

export const makeSelectLegalSet = () => createSelector([selectLegalMoves], (moves) => new Set(moves.map((m) => `${m.row},${m.column}`)))

export const makeSelectFlippedSet = () =>
	createSelector(
		[selectBoard, selectTurn, selectLegalMoves, (_: RootState, hover: Position | null) => hover],
		(board, turn, legalMoves, hover) => {
			if (!hover) return new Set<string>()
			const isLegal = legalMoves.some((m) => m.row === hover.row && m.column === hover.column)
			if (!isLegal) return new Set<string>()
			const flips = engineGetFlipped(board, hover, turn)
			return new Set(flips.map((p) => `${p.row},${p.column}`))
		}
	)
