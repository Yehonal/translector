import path from "path"

import { app } from 'electron';

export default {
    development: {
        // sqlite! now!
        dialect: 'sqlite',

        // the storage engine for sqlite
        // - default ':memory:'
        storage: path.resolve(app.getPath('userData'),'tldb.sqlite'),
        operatorsAliases: false
    },
    production: {
        // sqlite! now!
        dialect: 'sqlite',

        // the storage engine for sqlite
        // - default ':memory:'
        storage: path.resolve(app.getPath('userData'),'tldb.sqlite'),
        operatorsAliases: false
    }
};
