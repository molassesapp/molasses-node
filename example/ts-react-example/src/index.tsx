import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import * as serviceWorker from "./serviceWorker"
import { MolassesClient } from "@molassesapp/molasses-js"

const client = new MolassesClient({
  APIKey: process.env.REACT_APP_MOLASSES_API_KEY!,
})
client.init().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App client={client} />
    </React.StrictMode>,
    document.getElementById("root"),
  )

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister()
})
