import React, { Component } from 'react';
import buildGraphQLProvider from 'ra-data-graphql';
import { GraphQLList } from "graphql"
import { Route } from 'react-router';
import PostIcon from '@material-ui/icons/Book';
import Voyager from "./views/Voyager"
import { getIntrospectionQuery as rawIntrospectionQuery, buildClientSchema } from 'graphql/utilities';
import { Admin, Resource } from 'react-admin';
import gql from "graphql-tag"
import { CustomShow, CustomEdit, CustomCreate } from "./views/Single"
import lodash from "lodash"
import pluralize from 'pluralize';
import AppLayout from './Layout';
import buildQuery from "./helpers/buildQuery"
import List from "./views/List"
import { parseData } from "@hw-core/js-common/json"

import { ApolloConsumer } from "react-apollo";

export default class Dashboard extends Component {
    constructor() {
        super();
        this.state = {
            dataProvider: null,
            resourceList: null
        };
    }

    async componentDidMount() {
        let client = this.client;
        const introspectionQuery = gql(rawIntrospectionQuery());

        const getSchema = async (client) => {
            const { data } = await client.query({ query: introspectionQuery });
            const schema = buildClientSchema(data);

            return schema;
        };

        let introspectionResults = await getSchema(client);

        let introRes = []
        let queries = Object.keys(introspectionResults._queryType._fields).sort();
        for (let id in queries) {
            let queryName = queries[id];
            let query = introspectionResults._queryType._fields[queryName];

            if (!query || !(query.type instanceof GraphQLList))
                continue;

            // only tables with id field can be displayed
            if (!query.args.find(v => v.name === "id"))
                continue;

            let type = query.type.ofType.name;

            let lName = type.charAt(0).toLowerCase() + type.slice(1);

            introRes.push({
                infoQuery: lName + "Default",
                type: type,
                queryName: queryName
            });
        }

        let infoQuery = gql`
            query {
                ${introRes.map(v => v.infoQuery).join("\n")}
            }
        `
        const { data } = await client.query({ query: infoQuery });

        let resourceList = [];
        for (let id in introRes) {
            let type = introRes[id].type;

            let lName = type.charAt(0).toLowerCase() + type.slice(1) + "Default";
            let infoData = parseData(data[lName]);

            let list;
            if (!infoData.isReference) {
                list=(props) => (
                    <List introspectionResults={introspectionResults}
                        type={introRes[id].type}
                        query={introRes[id].queryName}
                        info={data}
                        parentProps={props} />
                )
            }

            resourceList.push(<Resource
                key={introRes[id].queryName}
                name={introRes[id].queryName}
                show={(props) => <CustomShow introspectionResults={introspectionResults} type={introRes[id].type} info={data} parentProps={props} />}
                edit={(props) => <CustomEdit introspectionResults={introspectionResults} type={introRes[id].type} info={data} parentProps={props} />}
                create={(props) => <CustomCreate introspectionResults={introspectionResults} type={introRes[id].type} info={data} parentProps={props} />}
                list={list}
                icon={PostIcon}
                options={{ label: lodash.startCase(pluralize(introRes[id].type)) }}></Resource>)
        }

        let dataProvider = await buildGraphQLProvider({
            client,
            buildQuery: (introspectionResults) => buildQuery(introspectionResults, data)
        });

        this.setState({ dataProvider, resourceList })
    }

    render() {
        return (
            <ApolloConsumer>
                {client => {
                    this.client = client;

                    if (!this.state.dataProvider) {
                        return <div>Loading...</div>
                    }

                    return <Admin customRoutes={[
                        <Route
                            path="/db_schema"
                            render={Voyager}
                        />,
                    ]} dataProvider={this.state.dataProvider} appLayout={AppLayout}>
                        {this.state.resourceList}
                    </Admin>
                }}
            </ApolloConsumer>
        );
    }
}