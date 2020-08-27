# Molasses-JS

<p align="center">
<img src="https://raw.githubusercontent.com/molassesapp/molasses-go/main/logo.png" style="margin: 0px auto;" width="200"/></p>

<h1 align="center">Molasses JS</h1>

It includes the Browser (with TypeScript support) SDK for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

`Molasses-JS` - Once initialized, it takes microseconds to evaluate if a user is active.

## Install

`npm install @molassesapp/molasses-server`

`yarn add @molassesapp/molasses-server`

`<script src="https://cdn.jsdelivr.net/npm/@molassesapp/molasses-js@0.2.7/dist/molasses.min.js"></script>`

## Usage

To Require:

```js
import { MolassesClient } from "@molassesapp/molasses-server"
// or
const { MolassesClient } = require("@molassesapp/molasses-server")
// or if using a script tag
var MolassesClient = MolassesJS.MolassesClient
```

Using it:

```js
// Initialize with your API Key
const client = new MolassesClient({
  APIKey: "testapikey",
})

// Then init which is a promise
await client.init()

// Once initialized you can start calling isActive
client.isActive("FOO_TEST", {
  id: "123",
  params: {
    isBetaUser: "true",
  },
})
```

`isActive` can be called in two different ways

---

### `isActive(featureKey: string)`

Will check if feature is active for ALL users

### `isActive(featureKey: string, user: User)`

Will check if the feature is active for this particular based on the segment they are in.
