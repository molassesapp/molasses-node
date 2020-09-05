<p align="center">
<img src="https://raw.githubusercontent.com/molassesapp/molasses-go/main/logo.png" style="margin: 0px auto;" width="200"/></p>

<h1 align="center">React Molasses</h1>

[![codecov](https://codecov.io/gh/molassesapp/molasses-node/branch/main/graph/badge.svg)](https://codecov.io/gh/molassesapp/molasses-node) ![Build status](https://github.com/molassesapp/molasses-node/workflows/Node.js%20CI/badge.svg)

It includes the React (with TypeScript support) SDK for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

`react-molasses` offers a provider with hooks and `with` support. Once initialized, it takes microseconds to evaluate if a user is active. `react-molasses` does rely on `molasses-js` as a client.

## Install

`npm install @molassesapp/molasses-js @molassesapp/react-molasses`

`yarn add @molassesapp/molasses-js @molassesapp/react-molasses`

## Usage

To Require:

```js
import { MolassesClient } from "@molassesapp/molasses-js"
import { MolassesProvider } from "@molassesapp/react-molasses"
```

Initialize the same way you would with `molasses-js`, but wrap your main application in the `MolassesProvider`

```js
// Initialize with your API Key
const client = new MolassesClient({
  APIKey: "testapikey",
})

// Then init which is a promise
client.init().then(() => {
  const AppContainer = () => {
    return (
      <MolassesProvider client={client}>
        <Router>
          <App />
        </Router>
      </MolassesProvider>
    )
  }

  ReactDOM.render(<AppContainer />, document.getElementById("root"))
})
```

Once it's initialized, you can then use Molasses in any component using React's context api. We've created a set of hooks and components to make this easier for you.

---

## Components and Hooks

### `MolassesProvider`

Wraps any children and provides the `MolassesClient` in the `React.context`. Molasses must be initialized before it can be used.

#### Props

| Prop   | required | type             | description                                                   |
| ------ | -------- | ---------------- | ------------------------------------------------------------- |
| client | required | `MolassesClient` | the initialized MolassesClient to pass into the react context |

### `<Feature name="NAME" user={user}>`

A component to evaluate a Feature by name. It can be used in several different ways, declarative using children, function based and using the `render` prop.

#### Props

| Prop   | required | type      | description                             |
| ------ | -------- | --------- | --------------------------------------- |
| name   | required | `string`  | The name of the feature to be evaluated |
| user   | optional | `User`    | The user who to evaluate against        |
| render | optional | `Function | JSX.Element`                            | What to render based on the result of the evaluation |
| render | optional | `Function | JSX.Element`                            | What to render based on the result of the evaluation |

#### Examples

```jsx
const Component = (props) => (
  <Feature name="NEW_CHECKOUT" user={user}>
    <div>I'll render if NEW_CHECKOUT is active for that user</div>
  </Feature>
)

const ComponentB = (props) => (
  <Feature
    name="NEW_CHECKOUT"
    user={user}
    render={(isActive: boolean) => {
      return isActive ? <span>I'll render if I'm active</span> : <span>I won't</span>
    }}
  />
)

const ComponentC = (props) => (
  <Feature name="NEW_CHECKOUT" user={user}>
    {(isActive: boolean) => {
      return isActive ? <span>I'll render if I'm active</span> : <span>I won't</span>
    }}
  </Feature>
)
```

### `useFeature(name: string, user: User): boolean`

A hook to determine if a given feature is active for a `User`. Uses the Molasses context under the hood

### `useMolasses(): MolassesClient`

A hook to expose the Molasses client to a component

### `withMolasses(Component: React Component)`

A HOC that passes the `MolassesClient` as the prop `molasses` to the component

#### Example

```jsx
const comp = (props) => {
  const isActive = props.molasses.isActive("FOO_TEST")
  return isActive ? <h1>active</h1> : <h1>off</h1>
}
const Component = withMolasses(comp)
```
