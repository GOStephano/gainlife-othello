import Board from "@ui/components/Board"
import Controls from "@ui/components/Controls"
import ScorePanel from "@ui/components/ScorePanel"

export default function GamePage() {
	return (
		<div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 640, margin: "0 auto" }}>
			<ScorePanel />
			<Controls />
			<Board />
		</div>
	)
}
