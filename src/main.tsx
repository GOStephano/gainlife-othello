import { store } from "@app/store"
import GamePage from "@ui/pages/GamePage"
import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<GamePage />
		</Provider>
	</React.StrictMode>
)
