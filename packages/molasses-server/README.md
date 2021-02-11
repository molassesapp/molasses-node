<p align="center">
<img src="https://raw.githubusercontent.com/molassesapp/molasses-go/main/logo.png" style="margin: 0px auto;" width="200"/></p>

<h1 align="center">Molasses Node SDK</h1>

[![codecov](https://codecov.io/gh/molassesapp/molasses-node/branch/main/graph/badge.svg)](https://codecov.io/gh/molassesapp/molasses-node) ![Build status](https://github.com/molassesapp/molasses-node/workflows/Node.js%20CI/badge.svg)

`Molasses-server` includes the Node (with TypeScript support) SDK for Molasses. It allows you to evaluate a user's status for a feature. It also helps simplify logging events for A/B testing.

The SDK uses SSE to communicate with the Molasses Application. Once initialized, it takes microseconds to evaluate if a user is active. When you update a feature on Molasses, it sends that update to all of your clients through SSE and users would start experiencing that change instantly.

## Install

`npm install @molassesapp/molasses-server`

`yarn add @molassesapp/molasses-server`

## Usage

To Require:

```js
import { MolassesClient } from "@molassesapp/molasses-server"
// or
const { MolassesClient } = require("@molassesapp/molasses-server")
```

Start by initializing the client with an `APIKey`. This begins the polling for any feature updates. The updates happen every 15 seconds. This can be overriden with the `refreshInterval` field. If you decide not to track analytics events (experiment started, experiment success) you can turn them off by setting the `sendEvents` field to `false`

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

### Track Events

If you want to track any event call the `track` method. `track` takes the event's name, the molasses User and any additional parameters for the event.

```js
client.track(
  "Checkout complete",
  {
    version: "v2.3.0",
  },
  {
    id: "baz",
    params: {
      teamId: "12356",
    },
  },
)
```

### Experiments

To track whether an experiment has started you can call `experimentStarted`. experimentStarted takes the feature's name, the molasses User and any additional parameters for the event.

```js
client.experimentStarted(
  "GOOGLE_SSO",
  {
    version: "v2.3.0",
  },
  {
    id: "baz",
    params: {
      teamId: "12356",
    },
  },
)
```

To track whether an experiment was successful you can call `experimentSuccess`. `experimentSuccess` takes the feature's name, the molasses User and any additional parameters for the event.

```js
client.ExperimentSuccess(
  "GOOGLE_SSO",
  {
    version: "v2.3.0",
  },
  {
    id: "baz",
    params: {
      teamId: "12356",
    },
  },
)
```

---

## Methods

### `new MolassesClient(options)`

Creates a new Molasses client. It takes a set of options.

#### Options

| Field             | Required | Type      | Description                                                                                 |
| ----------------- | -------- | --------- | ------------------------------------------------------------------------------------------- |
| `apiKey`          | required | `string`  | The API Key for the current environment                                                     |
| `URL`             | optional | `string`  | the base URL for Molasses                                                                   |
| `autoSendEvents`  | optional | `boolean` | Whether to automatically send analytic events back to Molasses. Defaults to `false`.        |
| `refreshInterval` | optional | `number`  | If Polling, how often Molasses should fetch the updated configuration. Defaults to `15000`, |
| `streaming`       | optional | `boolean` | Whether Molasses should use SSE or polling. Defaults to `true`                              |

### `init()`

Fetches configuration of features and begins polling

### `isActive(featureKey: string)`

Will check if feature is active for ALL users

### `isActive(featureKey: string, user: User)`

Will check if the feature is active for this particular based on the segment they are in.

### `track(eventName: string, additionalInformation: string[InputType], user: User)`

Will send a track event. This includes the event name, the user data, and other metadata. If you want to include additional metadata use the `additionalInformation` argument.

### `experimentStarted(featureKey: string, additionalInformation: string[InputType], user: User)`

Will send an event started message when a user starts an a/b tests. This includes, whether user was in the experimental group (control or experiment), the experiment that was being tested and other metadata. If you want to include additional metadata use the `additionalInformation` argument.

### `experimentSuccess(featureKey: string, additionalInformation: string[InputType], user: User)`

Will send an event success message when a user completes a set goal. This includes, whether user was in the experimental group (control or experiment), the experiment that was being tested and other metadata. If you want to include additional metadata use the `additionalInformation` argument.

### `stop()`

Stops polling

```

```
