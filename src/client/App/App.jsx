import React from "react";
import Router from "./Router"

import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faRssSquare, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

import AppContext from "./App.context"

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