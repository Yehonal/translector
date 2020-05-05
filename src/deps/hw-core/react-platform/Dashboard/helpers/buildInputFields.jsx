import React from 'react';
import pluralize from 'pluralize';
import {
    SelectInput, ImageField, ImageInput, NumberInput, DateInput, BooleanInput, TextInput,
    ReferenceInput,
    required
} from "react-admin"
import RichTextInput from 'ra-input-rich-text';
import { GraphQLScalarType, GraphQLEnumType, GraphQLNonNull, GraphQLInputObjectType } from "graphql"
import { ManyRefInputField } from "../components/Fields"
import { parseData } from "@hw-core/js-common/json"

export default (type, action, fields, info) => {
    let jsxFields = [];

    let infoData;
    if (!pluralize.isSingular(type)) {
        let singular = pluralize.singular(type);

        let infoKey = singular.charAt(0).toLowerCase() + singular.slice(1) + "Default";
        infoData = parseData(info[infoKey]);
    } else {
        let infoKey = type.charAt(0).toLowerCase() + type.slice(1) + "Default";
        infoData = parseData(info[infoKey]);
    }

    Object.keys(fields).forEach((n, k) => {
        let nonNull = fields[n].type instanceof GraphQLNonNull;
        let v = fields[n];

        var validators = [];

        let type = nonNull ? v.type.ofType : v.type;

        let opt = {};
        let modelOpt = {};

        if (infoData) {
            if (infoData.api && infoData.api[action] && infoData.api[action].fields && infoData.api[action].fields[v.name])
                opt = infoData.api[action].fields[v.name];
            if (infoData.modelInfo)
                modelOpt = infoData.modelInfo.fields[v.name];
        }

        //TODO: hacky, to improve
        if ((infoData && v.name === infoData.idField) || v.name === "id" || v.name === "createdAt" || v.name === "updatedAt")
            return;

        if (nonNull) {
            validators.push(required())
        }

        if (modelOpt) {
            if (modelOpt.validate) {
                if (modelOpt.validate.notEmpty) {
                    validators.push((val) => {
                        if (!val || !val.trim())
                            return modelOpt.validate.notEmpty.msg
                    })
                }
            }
        }


        if (opt.type === "Picture" || (type instanceof GraphQLInputObjectType && type.name === "pictureTypeInput")) {

            jsxFields.push(
                <ImageInput source={v.name} label={v.name} accept="image/*" placeholder={<p>Drop your file here</p>} validate={validators}>
                    <ImageField src={"http://localhost:4000/" + v.picture} />
                </ImageInput>
            );
            return;
        }

        if (opt.type === "Enum" || type instanceof GraphQLEnumType) {
            let labels = opt.labels || [];

            jsxFields.push(<SelectInput key={k} source={v.name} choices={type.getValues().map((val, key) => ({ id: val.name, name: labels[key] || val.name }))} validate={validators} />)
            return;
        }

        if (type instanceof GraphQLScalarType) {
            switch (type.name) {
                case "Int":
                case "Float":
                    jsxFields.push(<NumberInput key={k} source={v.name} validate={validators} />)
                    return;
                case "Date":
                    jsxFields.push(<DateInput key={k} source={v.name} showTime validate={validators} />);
                    return;
                case "Boolean":
                    jsxFields.push(<BooleanInput key={k} source={v.name} validate={validators} />);
                    return;
                default:
                    jsxFields.push(opt.canHtml ? <RichTextInput key={k} source={v.name} validate={validators} /> : <TextInput key={k} source={v.name} validate={validators} />);
                    return;
            }
        }

        if (!pluralize.isSingular(v.name)) {
            jsxFields.push(<ManyRefInputField source={v.name} info={info}></ManyRefInputField >)
        } else {
            jsxFields.push(<ReferenceInput source={v.name} info={info}></ReferenceInput >)
        }

        return;
    });

    return {
        jsxFields
    }
}