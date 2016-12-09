import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Infinite from 'react-infinite';
import marked from 'marked';
import SimpleMDE from 'simplemde';
import 'whatwg-fetch';

import './index.css';
import './App.css';
import './simplemde.min.css'

const BASE_URI = 'http://localhost:3005';
const BITS_INDEX_PATH = '/bits';
const BITS_SEARCH_PATH = BITS_INDEX_PATH + '/search';

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

class BitEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  componentDidMount() {
    this.simplemde = new SimpleMDE({
      autofocus: true,
      initialValue: this.props.initialValue || '',
      spellChecker: false,
      status: ['autosave', 'words'],
    });

    let that = this;

    // Handle the change event on the SimpleMDE editor
    this.simplemde.codemirror.on('change', () => {
      // Save the value of the MDE element
      let value = that.simplemde.value();

      // Call the handleChange method on the component
      that.handleChange(value);
    });
  }

  componentWillUnmount() {
    this.simplemde.toTextArea();
    this.simplemde = null;
  }

  handleChange(value) {
    // Sets the value of the textarea
    this.setState({ value: value });
  }

  render() {
    return (
      <textarea value={this.state.value} />
    );
  }
}

class Markdown extends Component {
  getRawMarkup() {
    return { __html: marked(this.props.source, { sanitize: true })};
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
        <Markdown source={this.props.body} />
        {/* <Link to={`/bits/${this.props.num}`}>{this.props.body}</Link> */}
      </div>
    );
  }
}

class BitBox extends Component {
  constructor(props) {
    super(props);

    this.state = { items: [], loading: false };
    this.buildPreviews();
  }

  buildPreviews({ newProps = null, concatItems = false } = {}) {
    let props = newProps || this.props,
        bitURI = BASE_URI,
        that = this;

    if (props.query)
      bitURI += BITS_SEARCH_PATH + '?q=' + props.query;
    else
      bitURI += BITS_INDEX_PATH;

    fetch(bitURI)
    .then((response) => {
      return response.json();
    })
    .then((body) => {
      let newItems = body.map((item) => {
        return <BitPreview key={item.id} num={item.id} body={item.body} />;
      });

      if (concatItems)
        newItems = this.state.items.concat(newItems);

      that.setState({ items: newItems, loading: false });
    });
  }

  componentWillReceiveProps(newProps) {
    if (this.props.query != newProps.query)
      this.buildPreviews({ newProps: newProps });
  }

  handleLoad = () => {
    this.setState({ loading: true });
    this.buildPreviews({ concatItems: true });
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
        <ul>
          <li><Link to='/bits'>Bits</Link></li>
        </ul>
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