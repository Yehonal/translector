import React from "react";
import { Voyager } from 'graphql-voyager';
import "graphql-voyager/dist/voyager.css";
import fetch from 'isomorphic-fetch';

import config from "@this/conf/conf.js"

export async function introspectionProvider(query) {
    let response = await fetch(config.apiUrl + "/" + config.path, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
    });

    return await response.json();
}

export default () => <Voyager introspection={introspectionProvider} workerURI={process.env.PUBLIC_URL + '/voyager.worker.js'} />