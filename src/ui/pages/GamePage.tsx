import Board from "../components/Board"
import Controls from "../components/Controls"
import ScorePanel from "../components/ScorePanel"

export default function GamePage() {
	return (
		<div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 640, margin: "0 auto" }}>
			<ScorePanel />
			<Controls />
			<Board />
		</div>
	)
}
