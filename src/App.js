/* @flow */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
import Infinite from 'react-infinite';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// Fetch polyfill
import 'whatwg-fetch';
import BitEditor from './BitEditor';
import constants from './constants';
import { fetchWithSession } from './helpers';

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
        {/* <Markdown source={this.props.body + " " + this.props.num} /> */}
        <Link to={`/bits/${this.props.num}`}>{this.props.body}</Link> (<span>{this.props.num}</span>)
      </div>
    );
  }
}

/*
 Component to contain bit previews.

 If a search has been typed, the search is used to filter the previews. If
 no search has been typed, the user's bits are pulled in descending order.

 Fetches bit previews from the Rails backend, and renders them with draftJS.

*/
class BitBox extends Component {
  constructor(props) {
    super(props);

    this.state = { bits: [], loading: false, page: 1, numPages: 1 };
    this.buildPreviews();
  }

  /*
   Builds a list of bit previews for loading into an infinite scrolling
   container.

    Params:
      `nextProps`: a props object, in case we need to have the latest props
                   passed in before they've actually updated
      `newPage`: an integer page value, for paging through result lists from
                 the backend
      `concatBits`: whether to concatenate the bits that will be newly fetched
                    with the existing bits in the state.

  */
  buildPreviews({ nextProps = null,
                  newPage = null,
                  concatBits = false } = {}) {
    let props = nextProps || this.props,
        page  = newPage   || this.state.page,
        bitURI; // Our fetch URL

    // If we have been given a query through our props,
    if (props.query)
      // Fetch from the bits search endpoint
      bitURI = `${constants.BITS_SEARCH_PATH}?q=${props.query}&page=${page}`;
    // If not,
    else
      // Fetch from the bits index endpoint
      bitURI = `${constants.BITS_PATH}?page=${page}`;

    // Fetch our new bits, build the bit previews if successful, and update
    // the state
    fetchWithSession(bitURI)
    .then((response) => {
      return response.json();
    })
    .then((body) => {
      // Construct our new previews
      let newBits = body.bits.map((bit) => {
        // When using the search endpoint, the body for the bit is actually
        // stored under the _source attribute, so account for that.
        let bitBody = (bit._source) ? bit._source : bit;

        // Return a BitPreview.
        return <BitPreview key={bitBody.unique_id} num={bitBody.unique_id} body={bitBody.body.slice(0,30)} />;
      });

      // Concatenate if necessary
      if (concatBits)
        newBits = this.state.bits.concat(newBits);

      // Update state.
      this.setState({ bits: newBits, loading: false,
                      page: page, numPages: body.numPages });
    });
  }

  // Called when new props are received
  componentWillReceiveProps(nextProps) {
    // If our query has changed,
    if (this.props.query !== nextProps.query)
      // Update our bit previews. Reset the pager to 1, since we'll be starting
      // with a brand new result set.
      this.buildPreviews({ nextProps: nextProps, newPage: 1 });
  }

  // Called on infinite load
  handleLoad = () => {
    this.setState((prevState) => {
      // Increment our pager
      let newPage = prevState.page + 1;

      // If the new pager value is greater than the number of pages in the
      // result set, just return an empty object. We don't need to update the
      // state.
      if (newPage > prevState.numPages)
        return {};

      // Build new bit previews, updating the pager value and saying "yes" to
      // whether the new bits should be concatenated with the existing bit
      // list
      this.buildPreviews({ concatBits: true, newPage: newPage });

      // Update our state to have loading be true
      return { loading: true };
    });
  }

  // Shown when new elements are being loaded, specifically when 'loading'
  // is set to true in the state
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
                    loadingSpinnerDelegate={this.loadingElem()}
                    isInfiniteLoading={this.state.loading}>
            {this.state.bits}
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
        <Route path='new' component={() => (<BitEditor newBit={true} />)} />
        <Route path=':bitID' component={BitEditor} />
      </Route>
      <Route path='*' component={GenericNotFound} />
    </Route>
  </Router>,
  document.getElementById('root')
);