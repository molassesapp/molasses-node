<p align="center">
<img src="https://raw.githubusercontent.com/molassesapp/molasses-go/main/logo.png" style="margin: 0px auto;" width="200"/></p>

<h1 align="center">Molasses Javascript Libraries</h1>

[![codecov](https://codecov.io/gh/molassesapp/molasses-node/branch/main/graph/badge.svg)](https://codecov.io/gh/molassesapp/molasses-node) ![Build status](https://github.com/molassesapp/molasses-node/workflows/Node.js%20CI/badge.svg)

This is the monorepo for all things JavaScript and Molasses.
It includes both Node, React, and Browser (with TypeScript support) SDKs for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

## Packages

### [molasses-server](https://github.com/molassesapp/molasses-node/tree/main/packages/molasses-server)

Use for any `Node` based environments. Supports both JS and TS. It uses polling to check if you have updated features. Once initialized, it takes microseconds to evaluate if a user is active.

### [molasses-js](https://github.com/molassesapp/molasses-node/tree/main/packages/molasses-js)

the Browser (with TypeScript support) SDK for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

### [react-molasses](https://github.com/molassesapp/molasses-node/tree/main/packages/react-molasses)

the React (with TypeScript support) SDK for Molasses. Built on top of `molasses-js` offers a provider with hooks and HOCs. Once initialized, it takes microseconds to evaluate if a user is active. `react-molasses` does rely on `molasses-js` as a client.
