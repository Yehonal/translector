import Sequelize from "sequelize";
import SeqGQL from "@hw-core/node-platform/src/libs/SequelizeGQL"

/**
 * @instance
 * @param {Sequelize.Model} sequelize
 * @param {Sequelize} DataTypes
 */
export default function (sequelize, DataTypes) {

    var Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        }
    });

    SeqGQL.define(Category, {
        info: {
            searchFields: ["name"]
        }
    })


    return Category;
}