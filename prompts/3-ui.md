Create the following components in react and give them a basic enough styling to tile them correctly
A Board which will contain a map of Squares Squares which will be blank or colored depending on which player placed a coin in them
A ScorePanel and Control which will be able to start a new game, select the map size
These components will be contained in a page

```ts
import React from "react"

export type Cell = "." | "B" | "W"

interface SquareProps {
	r: number
	c: number
	cell: Cell
	isLegal?: boolean
	willFlip?: boolean
	isHoverTarget?: boolean
	onClick?: (row: number, column: number) => void
	onHoverIn?: (row: number, column: number, legal: boolean) => void
	onHoverOut?: () => void
}

const Square: React.FC<SquareProps> = ({
	r,
	c,
	cell,
	isLegal = false,
	willFlip = false,
	isHoverTarget = false,
	onClick,
	onHoverIn,
	onHoverOut,
}) => {
	const handleClick = () => onClick?.(r, c)
	const handleMouseEnter = () => onHoverIn?.(r, c, isLegal)
	const handleMouseLeave = () => onHoverOut?.()

	return (
		<button
			className={`ot-square ${isLegal ? "ot-legal" : ""} ${willFlip ? "ot-willflip" : ""} ${isHoverTarget ? "ot-hover" : ""}`}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			aria-label={`square-${r}-${c}`}
		>
			{cell !== "." && <span className={`ot-coin ${cell === "B" ? "ot-black" : "ot-white"}`} />}
		</button>
	)
}

export default Square
```

```ts
import React from "react"
import Square, { Cell } from "./Square"

export interface Position {
	row: number
	column: number
}

interface BoardProps {
	board: Cell[][]
	legalMoves?: Position[]
	flipped?: Set<string> // keys as "row,column"
	onSquareClick?: (row: number, column: number) => void
	onHoverIn?: (row: number, column: number, legal: boolean) => void
	onHoverOut?: () => void
	tileSize?: number // px
	gap?: number // px
}

const Board: React.FC<BoardProps> = ({ board, legalMoves = [], flipped, onSquareClick, onHoverIn, onHoverOut, tileSize = 48, gap = 4 }) => {
	const size = board.length
	const legalSet = React.useMemo(() => new Set(legalMoves.map((m) => `${m.row},${m.column}`)), [legalMoves])
	const isLegal = (r: number, c: number) => legalSet.has(`${r},${c}`)
	const isFlipped = (r: number, c: number) => flipped?.has(`${r},${c}`) ?? false

	return (
		<div
			className="ot-board"
			style={{
				gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
				gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
				gap,
			}}
		>
			{board.map((row, r) =>
				row.map((cell, c) => (
					<Square
						key={`${r}-${c}`}
						r={r}
						c={c}
						cell={cell}
						isLegal={isLegal(r, c)}
						willFlip={isFlipped(r, c)}
						onClick={onSquareClick}
						onHoverIn={onHoverIn}
						onHoverOut={onHoverOut}
					/>
				))
			)}
		</div>
	)
}

export default Board
```

```ts
import React from "react"

interface ScorePanelProps {
	black: number
	white: number
	turn: "B" | "W"
	finished?: boolean
	winner?: "B" | "W" | "TIE"
}

const ScorePanel: React.FC<ScorePanelProps> = ({ black, white, turn, finished, winner }) => {
	return (
		<div className="ot-card ot-score">
			<div className="ot-score-row">
				<span className="ot-dot ot-black" /> <strong>Black</strong>
				<span className="ot-flex-spacer" />
				<span>{black}</span>
			</div>
			<div className="ot-score-row">
				<span className="ot-dot ot-white" /> <strong>White</strong>
				<span className="ot-flex-spacer" />
				<span>{white}</span>
			</div>

			{!finished ? (
				<div className="ot-status">
					Turn: <span className={`ot-dot ${turn === "B" ? "ot-black" : "ot-white"}`} />
				</div>
			) : (
				<div className="ot-status">
					{winner === "TIE" ? (
						"Result: Tie"
					) : (
						<>
							Winner: <span className={`ot-dot ${winner === "B" ? "ot-black" : "ot-white"}`} />
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default ScorePanel
```

```ts
import React from "react"
import Board from "../components/Board"
import Controls, { GameConfig } from "../components/Controls"
import ScorePanel from "../components/ScorePanel"
import type { Cell } from "../components/Square"

function makeEmptyBoard(size: number): Cell[][] {
	return Array.from({ length: size }, () => Array.from({ length: size }, () => "." as Cell))
}

const initialConfig: GameConfig = { size: 8 }

const GamePage: React.FC = () => {
	const [config, setConfig] = React.useState<GameConfig>(initialConfig)
	const [board, setBoard] = React.useState<Cell[][]>(makeEmptyBoard(config.size))
	const [turn, setTurn] = React.useState<"B" | "W">("B")

	// super-basic demo scoring (counts coins on the board)
	const counts = React.useMemo(() => {
		let b = 0,
			w = 0
		for (const row of board)
			for (const c of row) {
				if (c === "B") b++
				else if (c === "W") w++
			}
		return { black: b, white: w }
	}, [board])

	const legalMoves = React.useMemo(() => [], []) // (plug your engine here)
	const flipped = React.useMemo(() => new Set<string>(), []) // (plug your engine here)

	const handleNewGame = (cfg: GameConfig) => {
		setConfig(cfg)
		setBoard(makeEmptyBoard(cfg.size))
		setTurn("B")
	}

	const handleSquareClick = (row: number, column: number) => {
		// purely visual demo: place a coin where clicked and alternate color
		setBoard((prev) => {
			if (prev[row][column] !== ".") return prev
			const next = prev.map((r) => r.slice())
			next[row][column] = turn
			return next
		})
		setTurn((prev) => (prev === "B" ? "W" : "B"))
	}

	return (
		<div className="ot-page">
			<header className="ot-header">
				<h1>Othello</h1>
			</header>

			<main className="ot-grid">
				<aside className="ot-left">
					<ScorePanel black={counts.black} white={counts.white} turn={turn} finished={false} />
					<Controls config={config} onNewGame={handleNewGame} />
				</aside>

				<section className="ot-center">
					<Board board={board} legalMoves={legalMoves} flipped={flipped} onSquareClick={handleSquareClick} />
				</section>

				<aside className="ot-right">
					{/* Reserved for logs, hints, AI controls, etc. */}
					<div className="ot-card">Right panel</div>
				</aside>
			</main>
		</div>
	)
}

export default GamePage
```

```css
.square {
	position: relative;
}
.ghost {
	pointer-events: none;
}
.ghost-flip {
	transition: opacity 100ms ease;
}
/* The faint hover disc — injected via ::after when hovering empty cells */
.square.empty::after {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	width: 34px;
	height: 34px;
	transform: translate(-50%, -50%);
	border-radius: 50%;
	opacity: 0;
	transition: opacity 120ms ease;
	pointer-events: none;
}

/* Show only on hover of empty cells */
.square.empty:hover::after {
	opacity: 1;
}

/* Color depends on whose turn it is */
.board[data-turn="B"] .square.empty:hover::after {
	background: rgba(0, 0, 0, 0.18); /* faint black */
}

.board[data-turn="W"] .square.empty:hover::after {
	background: rgba(255, 255, 255, 0.35); /* faint white */
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}
```
