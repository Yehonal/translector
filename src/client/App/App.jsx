import React from "react";
import { Link } from "react-router-dom";
import Router from "./Router"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faRssSquare, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

import conf from "@this/conf/conf"

import AppContext from "./App.context"

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';

library.add(faHome, faRssSquare, faExternalLinkAlt);

class App extends React.Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  componentDidMount() {
    window.prerenderReady = true;
  }

  render() {
    return (
      <AppContext>
        {appCtx =>
          <Router>
            
          </Router>
        }
      </AppContext>
    )
  }
};

export default App;