All the prompts are used on GPT-5 with the following context:

You’re building an Othello (Reversi) web app using React + TypeScript + Redux Toolkit.
You want:

A clean architecture where the engine (game logic) is separate from the UI.

The engine lives in src/lib/othello/core and exposes pure, reusable functions.

The Redux slice (engineSlice) is just an adapter—it delegates logic to the engine.

The UI (in src/ui) is composed of presentational components

Styling is basic but responsive, with components tiled cleanly using CSS Grid.
