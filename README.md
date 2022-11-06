# node-graphqxl

Node wrapper for compiling GraphQXL schemas in JS based projects.

## Install

Add `node-graphqxl` as a dev dependency

```shell
yarn add -D node-graphqxl
```
or
```shell
npm install --save-dev node-graphqxl
```

## Usage

The `graphqxl` binary will be available for compiling .graphqxl schemas.

```json
{
  "name": "my-package",
  "scripts": {
    "generate": "graphqxl my-file.graphqxl"
  }
}
```
