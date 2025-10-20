import { useDispatch } from "react-redux"
import { newGame } from "../../app/engineSlice"
import { toggleShowHints } from "../../app/uiSlice"

export default function Controls() {
	const d = useDispatch()

	return (
		<div style={{ display: "grid", gap: 8 }}>
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				<button onClick={() => d(newGame({ size: 6 }))}>New 6x6</button>
				<button onClick={() => d(newGame({ size: 8 }))}>New 8x8</button>
				<button onClick={() => d(newGame({ size: 10 }))}>New 10x10</button>

				<button onClick={() => d(toggleShowHints())}>Toggle Hints</button>
			</div>

			<fieldset style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid #ddd", padding: 8, borderRadius: 6 }}>
				<legend style={{ padding: "0 6px" }}>Opponent</legend>
			</fieldset>
		</div>
	)
}
