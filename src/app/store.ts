import { configureStore } from "@reduxjs/toolkit"
import game from "./engineSlice"
import ui from "./uiSlice"

export const store = configureStore({ reducer: { game, ui } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
