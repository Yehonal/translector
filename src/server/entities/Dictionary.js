import Sequelize from "sequelize";
import SeqGQL, {
    SGQLEnumField,
    SGQLTextField,
    SGQLPictureField,
} from "@hw-core/node-platform/src/libs/SequelizeGQL"

/**
 * @instance
 * @param {Sequelize.Model} sequelize
 * @param {Sequelize} DataTypes
 */
export default function (sequelize, DataTypes) {

    var Dictionary = sequelize.define('Dictionary', {

        lang: {
            type: Sequelize.ENUM,
            values: ['it_en', 'it_es', 'en_it', 'en_es', 'es_en', 'es_it'],
            allowNull: false,
        },

        src: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Source word cannot be empty!"
                }
            }
        },

        dst: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Dest word cannot be empty!"
                }
            }
        },

        notes: {
            type: DataTypes.TEXT,
        },
    });

    Dictionary.associate = function (models) {
        models.Dictionary.belongsToMany(models.Category, { through: "CatRel" });
        models.Category.belongsToMany(models.Dictionary, { through: "CatRel" });
    }

    SeqGQL.define(Dictionary, {
        info: {
            name: "src",
            searchFields: ["src", "dst", "notes"],
            api: {
                all: {
                    fields: {
                        lang: new SGQLEnumField({ labels: ['Italiano -> English', 'Italiano -> Español', 'English -> Italiano', 'English -> Español', 'Español -> English', 'Español -> Italiano'] }),
                        //src: new SGQLTextField(),
                        //dest: new SGQLTextField(),
                        notes: new SGQLTextField({ canHtml: true })
                    }
                }
            }
        }
    })


    return Dictionary;
}