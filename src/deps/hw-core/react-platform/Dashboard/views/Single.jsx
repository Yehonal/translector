import React from 'react';
import { Show, SimpleShowLayout, SimpleForm, Edit, Create } from 'react-admin';

import buildFields from "../helpers/buildFields"
import buildInputFields from "../helpers/buildInputFields"

export const CustomShow = ({ type, introspectionResults, info, parentProps }) => {
    console.log(parentProps)

    let fields = introspectionResults._typeMap[type]._fields;

    const { jsxFieldsExpand } = buildFields(type, fields, info)

    return (
        <Show {...parentProps}>
            <SimpleShowLayout>
                {jsxFieldsExpand}
            </SimpleShowLayout>
        </Show>
    )
};

export const CustomEdit = ({ type, introspectionResults, info, parentProps }) => {
    console.log(parentProps)

    let fields = introspectionResults._typeMap[type + "EditInput"]._fields;

    const { jsxFields } = buildInputFields(type, "update", fields, info)

    return (
        <Edit title={<span>Edit {type}</span>}  {...parentProps}>
            <SimpleForm>
                {jsxFields}
            </SimpleForm>
        </Edit>
    )
};

export const CustomCreate = ({ type, introspectionResults, info, parentProps }) => {
    console.log(parentProps)

    let fields = introspectionResults._typeMap[type + "AddInput"]._fields;

    const { jsxFields } = buildInputFields(type, "create", fields, info)

    return (
        <Create title={<span>Create {type}</span>} {...parentProps}>
            <SimpleForm>
                {jsxFields}
            </SimpleForm>
        </Create>
    )
};