import React from 'react';
import { BrowserRouter as Router, Switch, Route  } from "react-router-dom";

import Dashboard from "@this/src/client/Routes/Home"

import conf from "@this/conf/conf"

/**
 * This function is used by our sitemap generator
 * DO NOT REMOVE this method, just change routes to your needs
 * if you want to exclude some routes from sitemap just
 * add them directly inside the <Router>
 */
export const routePaths = () => (
    <Switch>
    </Switch>
)

export default (props) => (
    <Router basename={conf.basePath}>
        <div>
            {props.children}
            {routePaths()}
            <Switch>
                <Route path="/" component={Dashboard} />
            </Switch>
        </div>
    </Router >
);