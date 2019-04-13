import gql from "graphql-tag"

import { parseData } from "@hw-core/js-common/json"

export default (introspectionResults, infoData) => (raFetchType, resourceName, params) => {

    const resource = introspectionResults.queries.find(r => r.name === resourceName);

    let outTypeName = resource.type.ofType.name;

    const outType = introspectionResults.types.find(r => r.name === outTypeName);

    let lName = outTypeName.charAt(0).toLowerCase() + outTypeName.slice(1);

    var resInfo = parseData(infoData[lName + "Default"]);
    let idField = resInfo.idField || "id";

    var searchFields = (resInfo && resInfo.searchFields) || ["name"];

    let limit, offset, order, id, where;
    if (params) {
        if (params.ids) {
            id = { in: params.ids }
        } else if (params.id) {
            id = params.id;
        }

        if (params.pagination && params.pagination.perPage) {
            limit = params.pagination.perPage;
            offset = limit * (params.pagination.page - 1);
        }

        if (params.filter) {
            let _where = { and: [] }
            if (params.filter.q) {
                _where.and.push({
                    "or": searchFields.map(v => ({
                        [v]: { like: "%" + params.filter.q.replace(/ /g, "%") + "%" }
                    }))
                })
            }

            delete params.filter.q;

            for (let id in params.filter) {
                let value = params.filter[id];
                let field = id.substring(1); // remove "_" character

                const addCond = (value) => {
                    let condition;
                    switch (typeof value) {
                        case "number":
                            condition = { eq: value }
                            break;
                        case "boolean":
                            condition = value
                            break;
                        case "string":
                        default:
                            condition = { like: "%" + value + "%" }
                            break;
                    }

                    return {
                        [field]: condition
                    }
                }

                if (Array.isArray(value)) {
                    _where.and.push({
                        or: value.map(v => addCond(v))
                    })
                } else {
                    _where.and.push(addCond(value));
                }
            }

            where = JSON.stringify(_where);
        }

        if (params.sort && params.sort.field) {
            order = params.sort.order === "DESC" ? "reverse:" + params.sort.field : params.sort.field;
        }
    }


    let fieldsGQL = outType.fields.map(v => {
        // && edges.type.ofType.kind==="Object"*/
        switch (v.type.kind) {
            case "OBJECT":
                let connection = introspectionResults.types.find(r => r.name === v.type.name)
                if (connection) {
                    let edges = connection.fields.find(f => f.name === "edges");
                    if (edges && edges.type.kind === "LIST") {

                        let edge = introspectionResults.types.find(r => r.name === edges.type.ofType.name)
                        let node = edge.fields.find(r => r.name === "node")
                        let nodeType = introspectionResults.types.find(r => r.name === node.type.name)

                        let lNodeName = nodeType.name.charAt(0).toLowerCase() + nodeType.name.slice(1);
                        let nodeInfo = parseData(infoData[lNodeName + "Default"]) || {};
                        let hasName = nodeType.fields.find(r => r.name === "name")

                        let nodeIdField = nodeInfo.idField || "id";
                        let nodeNameFields = !nodeInfo.name ?
                            (hasName ? "name" : "") :
                            (typeof nodeInfo.name === "string" ? nodeInfo.name : nodeInfo.name.fields.join("\n"));


                        return `${v.name}(limit:3) { edges {
                            node {
                                ${nodeIdField}
                                ${nodeNameFields}
                            } } 
                                count
                        }`
                    } else {
                        let nodeType = introspectionResults.types.find(r => r.name === v.name)
                        let hasName = nodeType.fields.find(r => r.name === "name")

                        let lNodeName = nodeType.name.charAt(0).toLowerCase() + nodeType.name.slice(1);
                        let nodeInfo = parseData(infoData[lNodeName + "Default"]);

                        let nodeIdField = nodeInfo.idField || "id";
                        let nodeNameFields = !nodeInfo.name ?
                            (hasName ? "name" : "") :
                            (typeof nodeInfo.name === "string" ? nodeInfo.name : nodeInfo.name.fields.join("\n"));

                        return `${v.name} { 
                            ${nodeIdField}
                            ${nodeNameFields}
                        }`
                    }
                }
                break;
            default:
        }

        return v.name;
    }).join("\n");


    switch (raFetchType) {
        case "GET_LIST":
            return {
                query: gql`query ${resource.name}($limit:Int,$offset:Int,$order: String,$where: SequelizeJSON) {
                    data: ${resource.name}(limit:$limit, offset:$offset, order: $order, where: $where) {
                        ${fieldsGQL}
                    },
                    total: ${lName}Count
                }`,

                variables: {
                    limit,
                    offset,
                    order,
                    where
                },
                parseResponse: response => {
                    if (response.data.data.length && !response.data.data[0].id) {
                        response.data.data = response.data.data.map((v, k) => {
                            v.id = k;
                            return v;
                        })
                    }

                    return response.data
                },
            }
        case "GET_MANY":
        case "GET_MANY_REFERENCE":

            where = {
                [idField]: id
            }

            return {
                query: gql`query ${resource.name}($limit:Int,$offset:Int,$order: String,$where: SequelizeJSON) {
                    data: ${resource.name}(limit:$limit, offset:$offset, order: $order, where: $where) {
                        ${fieldsGQL}
                    },
                    total: ${lName}Count(where: $where)
                }`,

                variables: {
                    limit,
                    offset,
                    order,
                    where: JSON.stringify(where)
                }, // params = { id: ... }
                parseResponse: response => { return response.data },
            }
        case "GET_ONE":
            where = {
                [idField]: id
            }

            return {
                query: gql`query ${resource.name}($where: SequelizeJSON) {
                    data: ${resource.name}(where: $where) {
                        ${fieldsGQL}
                    }
                }`,

                variables: {
                    where
                },
                parseResponse: response => {
                    if (response.data.data.length && !response.data.data[0].id) {
                        response.data.data = response.data.data.map((v, k) => {
                            v.id = k;
                            return v;
                        })
                    }

                    return { data: response.data.data[0] }
                },
            }
        case "CREATE":
        case "UPDATE":
            let action = raFetchType === "CREATE" ? "Add" : "Edit";
            let isUpdate = raFetchType === "UPDATE", updateArgs = ", set: true";

            let inputTypeName = resource.type.ofType.name + action + "Input";
            const inputType = introspectionResults.types.find(r => r.name === inputTypeName && r.kind === "INPUT_OBJECT");
            let fieldsObj = {}
            inputType.inputFields.map(f => fieldsObj[f.name] = f);

            let inputs = [];
            let variables = [];

            Object.keys(params.data).forEach((v, k) => {

                let opt = {}, modelOpt = {};

                if (resInfo.api) {
                    let queryInfo = resInfo.api[raFetchType.toLowerCase()];
                    opt = queryInfo && queryInfo.fields && queryInfo.fields[v];
                    modelOpt = resInfo.modelInfo && resInfo.modelInfo.fields[v];
                }

                let value = params.data[v];

                if (v === "__typename" || v === "createdAt" || v === "updatedAt")
                    return;

                let kind;
                let optType = opt && opt.type;
                if (fieldsObj[v] && fieldsObj[v].type)
                    kind = fieldsObj[v].type.kind === "NON_NULL" ? fieldsObj[v].type.ofType.kind : fieldsObj[v].type.kind;

                if (kind === "LIST") {

                    if (value.ids) {
                        let assocInfo = resInfo.modelInfo.associations[v];
                        let assoc = value.ids.map(id => `{${assocInfo.foreignIdentifier}: ${id}}`).join("\n");
                        inputs.push(`${v}: [${assoc}]`);
                    }
                } else if (kind === "ENUM" || optType === "Enum") {
                    inputs.push(`${v}: ${value}`);
                } else if (kind === "pictureTypeInput" || optType === "Picture") {
                    variables.push({
                        name: "picture",
                        type: "Upload",
                        value: value.rawFile
                    });

                    inputs.push(`${v}: {file: $picture}`);
                } else {
                    switch (typeof value) {
                        case "string":
                            inputs.push(`${v}: "${value}"`)
                            break;
                        default:
                            inputs.push(`${v}:${value}`)
                            break;
                    }
                }
            })

            if (isUpdate) {
                if (where)
                    updateArgs += `, where: ${where}`

                updateArgs += `, id: ${id}`;
            }

            let varArgs = "";
            if (variables.length) {
                varArgs = "(" + variables.map(v => "$" + v.name + ":" + v.type).join() + ")"
            }

            let gqlStr = `mutation ${lName}${action}${varArgs} {
                    data: ${lName}${action}(${outTypeName}:{${inputs}}${updateArgs}) {
                        ${fieldsGQL}
                    }
                }`

            let _vars = {}
            variables.forEach(v => _vars[v.name] = v.value);

            return {
                query: gql(gqlStr),
                parseResponse: response => {
                    return response.data
                },
                variables: _vars
            }
        case "DELETE":
        case "DELETE_MANY":

            let ids = params.ids ? params.ids : [params.id]

            return {
                query: gql`mutation {
                    ${ids.map(v => `delete${v}: ${lName}Delete(id:${v})`)}
                }`,

                parseResponse: response => {
                    return { data: [params.previousData] }
                },
            }
        default:
            return null;
    }
}