import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"

export default function ScorePanel() {
	const { blackScore, whiteScore, turn, finished, winner } = useSelector((s: RootState) => s.game)
	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<span>● Black: {blackScore}</span>
			<span>○ White: {whiteScore}</span>
			{!finished ? (
				<strong>Turn: {turn === "B" ? "Black" : "White"}</strong>
			) : (
				<strong>{winner === "TIE" ? "Tie" : winner === "B" ? "Black wins" : "White wins"}</strong>
			)}
		</div>
	)
}
