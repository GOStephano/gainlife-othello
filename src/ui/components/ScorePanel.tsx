import type { RootState } from "@app/store"
import { CELL_STATE, WINNING_COLOR } from "@lib/othello/core/constants"
import { useSelector } from "react-redux"

export default function ScorePanel() {
	const { blackScore, whiteScore, turn, finished, winner } = useSelector((s: RootState) => s.game)

	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<span>● Black: {blackScore}</span>
			<span>○ White: {whiteScore}</span>
			{!finished ? (
				<strong>Turn: {turn === CELL_STATE.BLACK ? "Black" : "White"}</strong>
			) : (
				<strong>{winner === WINNING_COLOR.TIE ? "Tie" : winner === WINNING_COLOR.BLACK ? "Black wins" : "White wins"}</strong>
			)}
		</div>
	)
}
