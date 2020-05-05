import React from 'react';
import pluralize from 'pluralize';
import { FunctionField, SelectField, NumberField, DateField, RichTextField, BooleanField } from "react-admin"
import { GraphQLScalarType, GraphQLEnumType } from "graphql"
import { ManyRefField, RefField } from "../components/Fields"
import { parseData } from "@hw-core/js-common/json"

export default (type, fields, info) => {
    let jsxFields = [], jsxFieldsExpand = [];

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
        let v = fields[n];

        let opt = {};
        // eslint-disable-next-line
        let modelOpt = {};

        if (infoData) {
            if (infoData.api && infoData.api["fetch"] && infoData.api["fetch"].fields && infoData.api["fetch"].fields[v.name])
                opt = infoData.api["fetch"].fields[v.name];
            if (infoData.modelInfo)
                modelOpt = infoData.modelInfo.fields[v.name];
        }

        if (v.type instanceof GraphQLScalarType) {
            switch (v.type.name) {
                case "Int":
                case "Float":
                    jsxFieldsExpand.push(<NumberField key={k} source={v.name} />)
                    return;
                case "Date":
                    jsxFields.push(<DateField key={k} source={v.name} showTime />);
                    return;
                case "Boolean":
                    jsxFields.push(<BooleanField key={k} source={v.name} />);
                    return;
                case "pictureType":
                    jsxFields.push(<FunctionField key={k} label={v.name} render={v => <img style={{ width: 200 }} alt={v.name} src={"http://localhost:4000/" + v.picture} />}></FunctionField>);
                    return;
                default:
                    jsxFields.push(<RichTextField key={k} source={v.name} />);
                    return;
            }

        } else if (v.type instanceof GraphQLEnumType) {
            jsxFields.push(<SelectField key={k} source={v.name} choices={v.type.getValues().map((v, k) => ({ id: v.name, name: opt.labels ? opt.labels[k] : v.name }))} />)
            return;
        } else {
            if (!pluralize.isSingular(v.name)) {
                jsxFields.push(<ManyRefField key={k} source={v.name} label={v.name} info={info} />);
            } else {
                jsxFieldsExpand.push(<RefField key={k} source={v.name} label={v.name} info={info} />);
            }

            return;
        }
    });

    jsxFieldsExpand = jsxFieldsExpand.concat(jsxFields);

    return {
        jsxFields,
        jsxFieldsExpand
    }
}