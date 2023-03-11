# React HSL Timetables

A web application for showing HSL timetables. Select your stop and view the next public transport scheduled to pass that stop.

Built with React and TypeScript. Runs with Vite.

## Getting started

This project uses Node and npm.

1. Install dependencies
   ```
   npm install
   ```
2. Start the development server
   ```
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000)

There is a pre-commit hook that runs [**prettier** code formatting](https://prettier.io/). Prettier can also be run manually using `npm run prettier`.

## Tests

```
npm run test
```

By default, only tests that have changed since the previous commit are run. Running `npm test` will run in a watch mode and give options to e.g. run all tests.

## Deployment

Deployment can currently be done only locally to GitHub pages with the `./deploy.sh` script.
