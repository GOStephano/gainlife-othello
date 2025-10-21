import game from "@app/slices/engineSlice"
import ui from "@app/slices/uiSlice"
import { configureStore } from "@reduxjs/toolkit"

export const store = configureStore({ reducer: { game, ui } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
