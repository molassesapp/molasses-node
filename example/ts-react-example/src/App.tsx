import React from "react"
import logo from "./logo.svg"
import "./App.css"
import { MolassesClient } from "@molassesapp/molasses-js"

const App = (props: { client: MolassesClient }) => {
  const isActive = props.client.isActive("TEST_FEATURE_FOR_USER", {
    id: "123",
    params: {},
  })
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{isActive ? "THE FEATURE IS ON" : "THE FEATURE IS OFF"}</p>
        <button
          onClick={() => {
            props.client.experimentSuccess(
              "TEST_FEATURE_FOR_USER",
              { logo },
              {
                id: "123",
                params: {},
              },
            )
          }}
        >
          CLICK ME
        </button>
      </header>
    </div>
  )
}

export default App
