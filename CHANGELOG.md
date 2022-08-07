# Change Log

All notable changes to the "@smonn/container" project will be documented in this file.

## v1.3.0 - 2022-08-07

- Bump dev dependencies.
- Improve type inference from `Token<T>` and `createToken` helpers.
- Switch to Vite for builds.
- Switch to Jest for tests.

## v1.2.1 - 2022-05-24

- Update readme

## v1.2.0 - 2022-05-24

- Bump dev dependencies.
- Allow tokens to be strings
- Allow `createToken` to accept a class/constructor
- Add examples for the above
- Ensure 100% test coverage

## v1.1.1 - 2022-04-29

- Dependency upgrades.

## v1.1.0 - 2022-03-31

- Add `Token<T>` interface and `createToken(name)` helper. This replaces `Symbol` usages to identify factories and instances.

## v1.0.1 - 2022-03-30

- Fix for importing in a Node.js module (ESM) environment.

## v1.0.0 - 2022-03-30

- Initial release
