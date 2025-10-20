import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { play } from "../../app/engineSlice"
import type { RootState } from "../../app/store"
import { makeSelectFlippedSet, makeSelectLegalSet, selectBoard, selectTurn } from "../selectors/gameSelectors"
import Square from "./Square"

export default function Board() {
	const dispatch = useDispatch()

	// base state
	const board = useSelector(selectBoard)
	const turn = useSelector(selectTurn)
	const showHints = useSelector((s: RootState) => s.ui.showHints)
	const size = board.length

	// local UI-only hover
	const [hoverPos, setHoverPos] = React.useState<{ row: number; column: number } | null>(null)

	// memoized selector instances
	const selectLegalSet = React.useMemo(makeSelectLegalSet, [])
	const selectFlippedSet = React.useMemo(makeSelectFlippedSet, [])

	// derived data (engine-powered but outside the component body logic)
	const legalSet = useSelector((s: RootState) => selectLegalSet(s))
	const flippedSet = useSelector((s: RootState) => selectFlippedSet(s, hoverPos))

	const isLegal = (r: number, c: number) => legalSet.has(`${r},${c}`)
	const isFlipped = (r: number, c: number) => flippedSet.has(`${r},${c}`)

	const handleClick = React.useCallback(
		(row: number, column: number) => {
			dispatch(play({ row, column }))
		},
		[dispatch]
	)

	const handleHoverIn = React.useCallback((row: number, column: number, legal: boolean) => {
		setHoverPos(legal ? { row, column } : null)
	}, [])

	const handleHoverOut = React.useCallback(() => setHoverPos(null), [])

	return (
		<div className="board" data-turn={turn} style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 48px)`, gap: 2 }}>
			{board.map((row, r) =>
				row.map((cell, c) => {
					const legal = isLegal(r, c)
					const empty = cell === "."
					const willFlip = isFlipped(r, c)
					const isHoverTarget = !!hoverPos && hoverPos.row === r && hoverPos.column === c && legal

					return (
						<Square
							key={`${r}-${c}`}
							r={r}
							c={c}
							cell={cell}
							legal={legal}
							empty={empty}
							willFlip={willFlip}
							isHoverTarget={isHoverTarget}
							turn={turn}
							showHints={showHints}
							onClick={handleClick}
							onHoverIn={handleHoverIn}
							onHoverOut={handleHoverOut}
						/>
					)
				})
			)}
		</div>
	)
}
