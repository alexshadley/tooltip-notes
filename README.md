# Tooltip Notes

## Project structure
* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory
* dist/js: Generated JavaScript files

## Dev
1. Setup: `yarn install`
2. Generate build file with `yarn run build`. Can constantly update build file with `yarn watch`.
3. Go to chrome://extensions and, with the developer mode checkbox ticked, load unpacked extension using the build file.
