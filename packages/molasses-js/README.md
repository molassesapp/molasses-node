# Molasses-JS

<p align="center">
<img src="https://raw.githubusercontent.com/molassesapp/molasses-go/main/logo.png" style="margin: 0px auto;" width="200"/></p>

<h1 align="center">Molasses JS</h1>

[![codecov](https://codecov.io/gh/molassesapp/molasses-node/branch/main/graph/badge.svg)](https://codecov.io/gh/molassesapp/molasses-node) ![Build status](https://github.com/molassesapp/molasses-node/workflows/Node.js%20CI/badge.svg)

It includes the Browser (with TypeScript support) SDK for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

`Molasses-JS` - Once initialized, it takes microseconds to evaluate if a user is active.

## Install

`npm install @molassesapp/molasses-server`

`yarn add @molassesapp/molasses-server`

`<script src="https://cdn.jsdelivr.net/npm/@molassesapp/molasses-js@0.4.1/dist/molasses.min.js"></script>`

## Usage

To Require:

```js
import { MolassesClient } from "@molassesapp/molasses-server"
// or
const { MolassesClient } = require("@molassesapp/molasses-server")
// or if using a script tag
var MolassesClient = MolassesJS.MolassesClient
```

Start by initializing the client with an `APIKey`. If you decide not to track analytics events (experiment started, experiment success) you can turn them off by setting the `sendEvents` field to `false`

```js
// Initialize with your API Key
const client = new MolassesClient({
  APIKey: "testapikey",
})

// Then init which is a promise
await client.init()
```

### Check if feature is active

You can call `isActive` with the key name and optionally a user's information. The ID field is used to determine whether a user is part of a percentage of users and uniquely identies a user. If you have other user segments based on user parameterss you can pass those in the `params` field.

```js
// Once initialized you can start calling isActive
client.isActive("FOO_TEST", {
  id: "123",
  params: {
    isBetaUser: "true",
  },
})
```

You can check if a feature is active for a user who is anonymous by just calling `isActive` with the key. You won't be able to do percentage roll outs or track that user's behavior.

```js
client.isActive("FOO_TEST")
```

### Experiments

To track whether an experiment was successful you can call `ExperimentSuccess`. ExperimentSuccess takes the feature's name, the molasses User and any additional parameters for the event.

```js
client.ExperimentSuccess(
  "GOOGLE_SSO",
  {
    id: "baz",
    params: {
      teamId: "12356",
    },
  },
  {
    version: "v2.3.0",
  },
)
```

---

## Methods

### `new MolassesClient(options)`

Creates a new Molasses client. It takes a set of options.

#### Options

| Field        | Required | Type      | Description                                                           |
| ------------ | -------- | --------- | --------------------------------------------------------------------- |
| `apiKey`     | required | `string`  | The API Key for the current environment                               |
| `URL`        | optional | `string`  | the base URL for Molasses                                             |
| `sendEvents` | optional | `boolean` | Whether to send analytic events back to Molasses. Defaults to `true`. |

### `init(): Promise<void>`

Fetches configuration of features and begins polling

### `isActive(featureKey: string): boolean`

Will check if feature is active for ALL users

### `isActive(featureKey: string, user: User): boolean`

Will check if the feature is active for this particular based on the segment they are in.

### `experimentSuccess(featureKey: string, additionalInformation: string[string], user: User): void`

Will send an event success message when a user completes a set goal. This includes, whether user was in the experimental group (control or experiment), the experiment that was being tested and other metadata. If you want to include additional metadata use the `additionalInformation` argument.

### `identify(user: User): void`

Sets the user as the default user for `isActive` and `experimentSuccess` so those methods can be called without a `User`

## `resetUser(): void`

Resets the user from `identify` to `undefined`

### `reinit(): Promise<void>`

Goes to the Molasses server and fetchs a new configuraiton
