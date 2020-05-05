import React from 'react';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import pluralize from "pluralize";
import { AutocompleteArrayInput, ReferenceArrayInput, AutocompleteInput, ReferenceInput } from "react-admin"
import { parseData } from "@hw-core/js-common/json"



const getName = (name, data) => {
    if (typeof name === "object") {
        let replacements = {};
        name.fields.map(v => replacements["%" + v + "%"] = data[v]);

        return name.format.replace(/%\w+%/g, function (all) {
            return replacements[all] || all;
        });
    } else {
        return name;
    }
}

const ManyRefField = ({ source, record = {}, info }) => {
    if (!record[source]["edges"] || !record[source]["edges"].length)
        return <span></span>;

    let singular = pluralize.singular(source);
    let lSingular = singular.charAt(0).toLowerCase() + singular.slice(1);
    let infoKey = lSingular + "Default";
    let reference = lSingular + "Get";
    let infoData = parseData(info[infoKey]);

    let nameField = infoData.name || "name";
    let idField = infoData.idField || "id";

    let total = record[source]["count"];
    const max = 3;

    let res = record[source]["edges"].map((v, k) => {
        let name = (info && info.name && getName(info.name, v["node"])) || v["node"][nameField] || v["node"][idField];

        return <a key={k} href={"#/" + reference + "/" + v["node"][idField]}>
            <Chip label={name}></Chip>
        </a>
    });

    if (total > max) {
        res.push(<Chip key={-1} label={"+" + (total - max)}></Chip>)
    }

    return res;
};

ManyRefField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

const ManyRefInputField = ({ source, record = {}, children, info, ...props }) => {
    let singular = pluralize.singular(source);
    let lSingular = singular.charAt(0).toLowerCase() + singular.slice(1);
    let infoKey = lSingular + "Default";
    let reference = lSingular + "Get";
    let infoData = parseData(info[infoKey]);

    let nameField = infoData.name || "name";
    let idField = infoData.idField || "id";

    if (record[source]) {

        let ids = record[source]["edges"] ? record[source]["edges"].map((v, k) => {
            return v.node[idField];
        }) : [];

        if (!record[source]["ids"])
            record[source]["ids"] = ids;
    }

    return <ReferenceArrayInput label={source} source={source + ".ids"} record={record} reference={reference} {...props}>
        <AutocompleteArrayInput optionText={nameField} optionValue={idField}></AutocompleteArrayInput>
    </ReferenceArrayInput>;
};

ManyRefInputField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

const RefField = ({ source, record = {}, info }) => {
    let singular = pluralize.singular(source);
    let lSingular = singular.charAt(0).toLowerCase() + singular.slice(1);
    let infoKey = lSingular + "Default";
    let reference = lSingular + "Get";
    let infoData = parseData(info[infoKey]);

    let nameField = infoData.name || "name";
    let idField = infoData.idField || "id";

    let name = (info && info.name && getName(info.name, record[source])) || record[source][nameField] || record[source][idField];
    return <a href={"#/" + reference + "/" + record[source][idField]}><Chip label={name}></Chip></a>
};

RefField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

const RefInputField = ({ source, record = {}, children, info, ...props }) => {
    let singular = pluralize.singular(source);
    let lSingular = singular.charAt(0).toLowerCase() + singular.slice(1);
    let infoKey = lSingular + "Default";
    let reference = lSingular + "Get";
    let infoData = parseData(info[infoKey]);

    let nameField = infoData.name || "name";
    let idField = infoData.idField || "id";

    if (record[source]) {

        let ids = record[source]["edges"] ? record[source]["edges"].map((v, k) => {
            return v.node[idField];
        }) : [];

        if (!record[source]["ids"])
            record[source]["ids"] = ids;
    }

    return <ReferenceInput label={source} source={source + ".ids"} record={record} reference={reference} {...props}>
        <AutocompleteInput optionText={nameField} optionValue={idField} />
    </ReferenceInput>;
};

RefInputField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

export {
    ManyRefField,
    ManyRefInputField,
    RefField,
    RefInputField
}