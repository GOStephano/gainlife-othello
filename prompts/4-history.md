Give me a couple of suggestion on how I could handle game history
So the player can eventually undo and redo his moves
No code or small code snippets

# Snapshot stack (Past/Present/Future)

- **How it works:** On every valid move, push `present` to `past`, set `present = next`, clear `future`. Undo pops from `past` to `present` and pushes old `present` to `future`; redo pulls from `future`.
- **Pros:** Easiest to reason about; trivial to implement; fast undo/redo.
- **Cons:** Memory grows with board snapshots.
- **Tips:**
  - Cap `past` length (e.g., last 100 moves).
  - Persist only the minimal `GameState` needed to render + compute next moves.
  - Redo must be cleared on any new move after an undo.

# Move list + recomputation

- **How it works:** Store only the **initial state** and a **list of moves**. Undo = drop last move; redo = reapply. Current board is recomputed from start.
- **Pros:** Very compact history; great for “export game” and deterministic replays.
- **Cons:** Recompute time increases with move count (mitigate with checkpoints).
- **Tips:**
  - Add periodic **checkpoints** (every N moves store a full snapshot) to bound recompute.
  - Include **pass moves** explicitly in the list, since Othello has forced passes.

# Reversible diffs (patches)

- **How it works:** For each move, store a **diff**: placed disc, all flipped positions, score delta, and previous turn. Undo = apply inverse patch; redo = reapply patch.
- **Pros:** Very memory-efficient; O(1) undo/redo; no full recompute.
- **Cons:** More bookkeeping; you must accurately record every flipped disc.
- **Tips:**
  - Record both forward and inverse patches at commit time.
  - Validate with tests around edge cases (multi-direction flips, pass turns).
