#!/bin/bash

NODE_ENV=test NODE_PATH=. ../../node_modules/.bin/mocha ./test/index.js --watch
