import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// Fetch polyfill
import 'whatwg-fetch';

// Components
import BitContainer from './BitContainer';
import BitEditor from './BitEditor';
import BitSearch from './BitSearch';
import GenericNotFound from './GenericNotFound';

// CSS
import '../styles/App.css';
import '../styles/Draft.css';
import '../styles/RichEditor.css';

class App extends Component {
  render() {
    return (
      <div className='app'>
        <div className='header'>
          {/* <Link to='/bits'>Bits</Link> */}
        </div>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={BitSearch}/>
      <Route path='bits' component={BitContainer}>
        <IndexRoute component={BitSearch}/>
        <Route path='new' component={() => (<BitEditor newBit={true} />)} />
        <Route path=':bitID' component={BitEditor} />
      </Route>
      <Route path='*' component={GenericNotFound} />
    </Route>
  </Router>,
  document.getElementById('root')
);