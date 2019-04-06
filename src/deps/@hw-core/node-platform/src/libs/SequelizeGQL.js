import Sequelize from "sequelize"
import "sequelize-graphql-schema/src/jsdoc.def.js"

/**
 * @typedef SequelizeGQLName
 * @property {Array} fields 
 * @property {string} format 
 */

/**
 * @typedef SequelizeGQLAuth
 * @property {Array|number} roles 
 * @property {boolean} sameUser 
 */

/**
 * @typedef SequelizeGQLField
 * @property {SequelizeGQLAuth} auth 
 */

/**
 * @typedef SequelizeGQLQuery
 * @property {SequelizeGQLAuth} auth 
 * @property {Object.<string,SequelizeGQLField>} fields 
 */

/**
 * @typedef SequelizeGQLQueries
 * @property {SequelizeGQLQuery} all 
 * @property {SequelizeGQLQuery} fetch
 * @property {SequelizeGQLQuery} create 
 * @property {SequelizeGQLQuery} delete
 * @property {SequelizeGQLQuery} update
 */

/**
 * @typedef SequelizeGQLInfo
 * @property {boolean} isReference - inform 3rd party tools that it's a reference table (can be used to avoid direct CRUD operations on it)
 * @property {string} idField 
 * @property {string|SequelizeGQLName} name 
 * @property {Array<string>} searchFields
 * @property {SequelizeGQLQueries} api
 * 
 */

/**
 * @typedef SequelizeGQLOpt
 * @property {SeqGraphQL} graphql
 * @property {SequelizeGQLInfo} info 
 */
/** @type {SequelizeGQLOpt} */
var defOpt = {
    graphql: {
        queries: {}
    },
    info: {
        api: {
            all: {
                auth: {
                    sameUser: false
                },
                fields: {
                    email: {
                        auth: {
                            sameUser: false
                        }
                    }
                }
            }
        }
    }
}

/**
 * This function will monkey-patch a Sequelize Model injecting the graphql property 
 * for sequelize-graphql-schema library extended with some useful info for "Default" query.
 * @instance
 * @param {Sequelize.Model} model - The sequelize model to monkey patch.
 * @param {SequelizeGQLOpt} opt - object with all information needed for sequelize-graphql-schema and our node-platform lib.
 */
export function define(model, opt = defOpt) {
    let name = model.name.charAt(0).toLowerCase() + model.name.slice(1);

    if (!opt.graphql) {
        opt.graphql = {}
    }

    if (!opt.graphql.queries)
        opt.graphql.queries = {}

    if (!opt.info) {
        opt.info = {}
    }

    opt.graphql.queries[name + "Default"] = {
        resolver: () => {
            let modelInfo = {
                fields: {},
                associations: {}
            };

            for (let attr in model.rawAttributes) {
                modelInfo.fields[attr] = {
                    ...model.rawAttributes[attr]
                }

                delete modelInfo.fields[attr]["Model"];
            }



            for (let attr in model.associations) {
                let assocInfo = model.associations[attr];
                modelInfo.associations[attr] = {
                    as: assocInfo.as,
                    associationType: assocInfo.associationType,
                    foreignKey: assocInfo.foreignKey,
                    foreignKeyField: assocInfo.foreignKeyField,
                    isAliased: assocInfo.isAliased,
                    isMultiAssociation: assocInfo.isMultiAssociation,
                    isSelfAssociation: assocInfo.isSelfAssociation,
                    sourceIdentifier: assocInfo.sourceIdentifier,
                    sourceKey: assocInfo.sourceKey,
                    target: assocInfo.target.name,
                }
            }

            return JSON.stringify({
                modelInfo,
                ...opt.info,
            })
        }
    }

    model.graphql = opt.graphql;
}

export default {
    define
}
