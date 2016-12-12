/* @flow */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
import Infinite from 'react-infinite';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// Fetch polyfill
import 'whatwg-fetch';
import BitEditor from './BitEditor';
import constants from './Constants';

// CSS files
import './index.css';
import './App.css';
import './Draft.css';
import './RichEditor.css';

class BitSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <div>
        <NewBitButton />
        <div>
          <input type='text' value={this.state.value} onChange={this.handleChange} />
        </div>
        <BitBox query={this.state.value} />
      </div>
    );
  }
}

class NewBitButton extends Component {
  render() {
    return (
      <Link to={`/bits/new`} className='btn btn-black'>New Bit</Link>
    );
  }
}

class Markdown extends Component {
  getRawMarkup() {
    return { __html: this.props.source };
  }

  render() {
    return (
      <span dangerouslySetInnerHTML={this.getRawMarkup()}></span>
    );
  }
}

class BitPreview extends Component {
  render() {
    return (
      <div className='infinite-list-item'>
        <Markdown source={this.props.body + " " + this.props.num} />
        {/* <Link to={`/bits/${this.props.num}`}>{this.props.body}</Link> */}
      </div>
    );
  }
}

class BitBox extends Component {
  constructor(props) {
    super(props);

    this.state = { items: [], loading: false, page: 1, numPages: 1 };
    this.buildPreviews({ newPage: 1 });
  }

  buildPreviews({ nextProps = null, newPage = null, concatItems = false } = {}) {
    let props = nextProps || this.props,
        page  = newPage   || this.state.page,
        that  = this,
        bitURI;

    if (props.query)
      bitURI = `${constants.BITS_SEARCH_PATH}?q=${props.query}&page=${page}`;
    else
      bitURI = `${constants.BITS_PATH}?page=${page}`;

    fetch(bitURI)
    .then((response) => {
      return response.json();
    })
    .then((body) => {
      console.log(body);

      let newItems = body.bits.map((item) => {
        return <BitPreview key={item.id} num={item.id} body={item.body} />;
      });

      if (concatItems)
        newItems = this.state.items.concat(newItems);

      that.setState({ items: newItems, loading: false, numPages: body.numPages });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.query !== nextProps.query)
      this.buildPreviews({ nextProps: nextProps });
  }

  handleLoad = () => {
    this.setState(function (prevState) {
      let newPage = prevState.page + 1;

      if (newPage > prevState.numPages)
        return {};

      this.buildPreviews({ concatItems: true, newPage: newPage });

      return { loading: true, page: newPage };
    });
  }

  loadingElem() {
    return (
      <div className='infinite-list-item'>
        Loading...
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className='infinite'>
          <Infinite elementHeight={40}
                    useWindowAsScrollContainer
                    containerHeight={250}
                    infiniteLoadBeginEdgeOffset={200}
                    onInfiniteLoad={this.handleLoad}
                    //loadingSpinnerDelegate={this.loadingElem()}
                    isInfiniteLoading={this.state.loading}>
            {this.state.items}
          </Infinite>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className='app'>
        <h1>App</h1>
        <div className='header'>
          <Link to='/bits'>Bits</Link>
        </div>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

class BitContainer extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

class GenericNotFound extends Component {
  render() {
    return (
      <div>
        Not found buddy
      </div>
    );
  }
}

// export default App;

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <Route path='bits' component={BitContainer}>
        <IndexRoute component={BitSearch}/>
        <Route path=':id' component={BitEditor} />
        <Route path='new' component={BitEditor} />
      </Route>
      <Route path='*' component={GenericNotFound} />
    </Route>
  </Router>,
  document.getElementById('root')
);