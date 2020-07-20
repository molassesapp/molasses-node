# Molasses-Node

A Node (with TypeScript support) SDK for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.

Molasses uses polling to check if you have updated features. Once initialized, it takes microseconds to evaluate if a user is active.

## Install

```
npm install molasses-node

yarn add molasses-node
```

## Usage

Start by initializing the client with an `APIKey`

```typescript
molasses.Init({
  APIKey: process.env("MOLASSES_API_KEY"),
});
```
