import { configureStore } from "@reduxjs/toolkit"
import game from "./engineSlice"

export const store = configureStore({ reducer: { game } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
