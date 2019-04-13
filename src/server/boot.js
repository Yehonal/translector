// use this file to configure boot process with babel and other
// dependencies that must run at very first start
// it allows,  together with .babelrc, import/export ES6 syntax
// working on nodejs via babel.
// Waiting for full nodejs support.

const path = require("path")

const rootPath=path.resolve(path.join(__dirname, "../../"));

process.chdir(rootPath);

require("@hw-core/node-platform/src/server/boot")({
    root: rootPath,
    extends: path.join(rootPath, '.babelrc'),
    ignore: [/node_modules/],
    only: [rootPath],
})

require("./master");