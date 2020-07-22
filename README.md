# Molasses-Javascript
This is the monorepo for all things JavaScript and Molasses. 
It includes both  Node and Browser (with TypeScript support) SDKs for Molasses. It allows you to evaluate user's status for a feature. It also helps simplify logging events for A/B testing.


`Molasses-server` uses polling to check if you have updated features. Once initialized, it takes microseconds to evaluate if a user is active.
