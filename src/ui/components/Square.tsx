import clsx from "clsx"
import React from "react"

type Turn = "B" | "W"

export interface SquareProps {
	r: number
	c: number
	cell: "." | "B" | "W"
	legal: boolean
	empty: boolean
	willFlip: boolean
	isHoverTarget: boolean
	turn: Turn
	showHints: boolean
	onClick: (r: number, c: number) => void
	onHoverIn: (r: number, c: number, legal: boolean) => void
	onHoverOut: () => void
}

function SquareBase({ r, c, cell, legal, empty, willFlip, isHoverTarget, turn, showHints, onClick, onHoverIn, onHoverOut }: SquareProps) {
	return (
		<button
			aria-label={`cell-${r}-${c}`}
			onClick={() => onClick(r, c)}
			onMouseEnter={() => onHoverIn(r, c, legal)}
			onMouseLeave={onHoverOut}
			className={clsx("square", { legal: showHints && legal, empty })}
			style={{
				width: 48,
				height: 48,
				background: "#147a2e",
				border: "1px solid #0b4e1e",
				position: "relative",
				borderRadius: 4,
				cursor: "pointer",
			}}
		>
			{cell !== "." && (
				<div
					className="disc"
					style={{
						width: 34,
						height: 34,
						borderRadius: "50%",
						background: cell === "B" ? "#111" : "#f5f5f5",
						margin: "auto",
					}}
				/>
			)}

			{empty && isHoverTarget && (
				<div
					className="ghost ghost-place"
					style={{
						width: 34,
						height: 34,
						borderRadius: "50%",
						background: turn === "B" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.6)",
						margin: "auto",
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				/>
			)}

			{willFlip && (
				<div
					className="ghost ghost-flip"
					style={{
						width: 34,
						height: 34,
						borderRadius: "50%",
						background: turn === "B" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)",
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						outline: "1px dashed rgba(0,0,0,0.15)",
					}}
				/>
			)}

			{/* tiny hint dot for legal moves (if enabled and not hover target) */}
			{showHints && legal && empty && !isHoverTarget && (
				<div
					style={{
						width: 10,
						height: 10,
						borderRadius: "50%",
						background: "rgba(255,255,255,0.7)",
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				/>
			)}
		</button>
	)
}

/** Memoize */
const Square = React.memo(SquareBase, (prev, next) => {
	return (
		prev.cell === next.cell &&
		prev.legal === next.legal &&
		prev.empty === next.empty &&
		prev.willFlip === next.willFlip &&
		prev.isHoverTarget === next.isHoverTarget &&
		prev.turn === next.turn &&
		prev.showHints === next.showHints
	)
})

export default Square
