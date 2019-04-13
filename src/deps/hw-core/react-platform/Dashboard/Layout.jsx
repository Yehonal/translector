import React from "react"
import { Layout } from 'react-admin';

import { AppBar, UserMenu, MenuItemLink } from 'react-admin';
import SettingsIcon from '@material-ui/icons/Settings';

const MyUserMenu = props => (
    <UserMenu {...props}>
        <MenuItemLink
            to="/db_schema"
            primaryText="DB Schema"
            leftIcon={<SettingsIcon />}
        />
    </UserMenu>
);

const MyAppBar = props => <AppBar {...props} userMenu={<MyUserMenu />} />;

const MyLayout = props => <Layout
    {...props}
    appBar={MyAppBar}
/>;

export default MyLayout;