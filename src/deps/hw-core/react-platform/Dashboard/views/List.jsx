import React from "react"
import {
    Show, SimpleShowLayout,
    Filter, TextInput, SelectArrayInput, NumberInput, DateInput, BooleanInput, EditButton,
    List, Datagrid,
} from 'react-admin';
import { GraphQLScalarType, GraphQLEnumType } from "graphql"
import pluralize from 'pluralize';
import { parseData } from "@hw-core/js-common/json"
import buildFields from "../helpers/buildFields"
import lodash from "lodash"

const ListFilter = ({ fields, info, type, ...props }) => {
    //let searchFields=info.searchFields;

    let infoData = info;

    let jsxInputFields = Object.keys(fields).map((n, k) => {
        let v = fields[n];

        let opt = {};
        //let modelOpt = {};

        if (infoData) {
            if (infoData.api && infoData.api["fetch"] && infoData.api["fetch"].fields && infoData.api["fetch"].fields[v.name])
                opt = infoData.api["fetch"].fields[v.name];
            //if (infoData.modelInfo)
            //    modelOpt = infoData.modelInfo.fields[v.name];
        }

        if (v.type instanceof GraphQLScalarType) {
            switch (v.type.name) {
                case "Int":
                case "Float":
                    return <NumberInput key={k} source={"_" + v.name} />
                case "Date":
                    return <DateInput key={k} source={"_" + v.name} showTime />
                case "Boolean":
                    return <BooleanInput key={k} source={"_" + v.name} />
                default:
                    return <TextInput key={k} source={"_" + v.name} />
            }
        } else if (v.type instanceof GraphQLEnumType) {
            return <SelectArrayInput  key={k} source={"_" + v.name} choices={v.type.getValues().map((val, key) => ({ id: val.name, name: opt.labels ? opt.labels[key] : val.name }))} />
        } else {
            /*if (!pluralize.isSingular(v.name)) {
                let singular = pluralize.singular(v.name);

                let infoKey = singular.charAt(0).toLowerCase() + singular.slice(1) + "Default";
                let infoData = parseData(info[infoKey]);

                return <ManyRefField key={k} source={v.name} label={v.name} info={infoData}></ManyRefField>
            } else {

                let infoKey = v.name.charAt(0).toLowerCase() + v.name.slice(1) + "Default";
                let infoData = parseData(info[infoKey]);

                return <RefField key={k} source={v.name} info={infoData} />
            }*/
            return null;
        }
    });

    return <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        {jsxInputFields}
    </Filter>
};

const ExpandPanel = ({ fields, ...props }) => <Show {...props}>
    <SimpleShowLayout>{fields}</SimpleShowLayout>
</Show>

export default (props) => {
    let name = props.type;
    const info = props.info;
    let fields = props.introspectionResults._typeMap[name]._fields;

    let singular = !pluralize.isSingular(name) ? pluralize.singular(name) : name;
    let rootInfoKey = singular.charAt(0).toLowerCase() + singular.slice(1) + "Default";

    const { jsxFields, jsxFieldsExpand } = buildFields(name, fields, info);

    return <List {...props.parentProps}
        title={<span>{lodash.startCase(pluralize(name))}</span>}
        sort={{ field: 'createdAt', order: 'DESC' }}
        filters={<ListFilter fields={fields} info={parseData(info[rootInfoKey])} />
        }>
        <Datagrid rowClick="edit" expand={<ExpandPanel fields={jsxFieldsExpand} />}>
            {jsxFields}
            <EditButton />
        </Datagrid>
    </List>
}