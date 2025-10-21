import game from "@app/engineSlice"
import ui from "@app/uiSlice"
import { configureStore } from "@reduxjs/toolkit"

export const store = configureStore({ reducer: { game, ui } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
