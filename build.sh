#!/bin/bash

rm -rf dist
mkdir dist
npm install --omit=dev

error_output=$(node build.js 2>&1 >/dev/null)

if [ $? -ne 0 ]; then
  echo "An error occurred:"
  echo "$error_output"
  rm -rf dist
  exit 1
fi

cp index.html dist/
cp -r src/ dist/
cp README.md dist/
cp LICENSE dist/
cp CONTRIBUTING.md dist/
cp CODE_OF_CONDUCT.md dist/