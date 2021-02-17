# End-to-end tests for solid-client in Node.js

This directory contains our Node.js-based end-to-end tests.

## Running the tests

To run the tests:

1. At the root, run `npm install`, followed by `npm run build`.
2. Run `npx @inrupt/generate-oidc-token`.
3. Copy `.env.default` to `.env.test.local` and update the values you generated
   from step 2.
4. You can now run `npm run e2e-test-node` from the root.

## Running these tests from an IDE

To run these tests from your IDE, you'll may need to setup your test
configuration to pick up the End-2-End test configuration from the root, e.g.,
by adding `--config=jest.e2e.config.js` to the Jest options.