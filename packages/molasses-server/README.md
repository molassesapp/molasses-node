# Molasses-server

> Molasses Node SDK

It includes the Node (with TypeScript support) SDK for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

`Molasses-server` uses polling to check if you have updated features. Once initialized, it takes microseconds to evaluate if a user is active.

## Install

`npm install @molassesapp/molasses-server`

`yarn add @molassesapp/molasses-server`

## Usage

```js
import { MolassesClient } from "@molassesapp/molasses-server"
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
