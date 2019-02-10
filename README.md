# React HSL Timetables

A web application for showing HSL stop timetables. Select your stop and view the next public transport scheduled to pass that stop.

Built with React, TypeScript, and Sass.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting started

This project uses Node 8 and yarn.

1. Install dependencies
   ```
   yarn install
   ```
2. Fix sass environment bindings
   ```
   npm rebuild node-sass
   ```
3. Start the development server
   ```
   yarn start
   ```
4. Open [http://localhost:3000](http://localhost:3000)

There is a pre-commit hook that runs [**prettier** code formatting](https://prettier.io/). Prettier can also be run manually using `yarn prettier`.

## Tests

```
yarn test
```

By default, only tests that have changed since the previous commit are run. Running `yarn test` will run in a watch mode and give options to e.g. run all tests.

## Deployment

You can make a production build with

```
yarn build
```

It will print out instructions on how to serve your builded files.
