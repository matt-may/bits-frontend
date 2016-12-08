import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Infinite from 'react-infinite';
import './index.css';
import './App.css';

const bits = [
  { body: 'My fair body' },
  { body: 'Hey there buddy'}
];

class BitSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div>
        <NewBitButton />
        <div>
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </div>
        <BitBox baseText={this.state.value}/>
      </div>
    );
  }
}

class NewBitButton extends Component {
  render() {
    return (
      <Link to={`/bits/new`} className="btn btn-black">New Bit</Link>
    );
  }
}

class BitEditor extends Component {
  render() {
    return (
      <div>i'm the editor!</div>
    );
  }
}

class BitPreview extends Component {
  render() {
    return (
      <div className="infinite-list-item">
        <Link to={`/bits/${this.props.num}`}>{this.props.body}</Link>
      </div>
    );
  }
}

class BitBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      elements: this.buildElements(0, 10),
      isInfiniteLoading: false
    };
  }

  buildElements(start, end, props) {
    var currentProps = props || this.props,
        elements = [];

    for (var i = start; i < end; i++) {
      elements.push(<BitPreview key={i} num={i} body={currentProps.baseText}/>)
    }

    return elements;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.baseText != nextProps.baseText) {
      this.setState(
        { elements: this.buildElements(0, 10, nextProps) }
      );
    }
  }

  handleInfiniteLoad = () => {
    var that = this;

    this.setState({
      isInfiniteLoading: true
    });

    setTimeout(function() {
      var elemLength = that.state.elements.length,
          newElements = that.buildElements(elemLength, elemLength + 1);

      that.setState({
        isInfiniteLoading: false,
        elements: that.state.elements.concat(newElements)
      });
    }, 5000);
  }

  elementInfiniteLoad() {
    return (
      <div className="infinite-list-item">
        Loading...
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="infinite">
          <Infinite elementHeight={40}
                    //useWindowAsScrollContainer
                    containerHeight={250}
                    infiniteLoadBeginEdgeOffset={200}
                    onInfiniteLoad={this.handleInfiniteLoad}
                    loadingSpinnerDelegate={this.elementInfiniteLoad()}
                    isInfiniteLoading={this.state.isInfiniteLoading}>
            {this.state.elements}
          </Infinite>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="app">
        <h1>App</h1>
        <ul>
          <li><Link to="/bits">Bits</Link></li>
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
        <h2>Bits</h2>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

// export default App;

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="bits" component={BitContainer}>
       <IndexRoute component={BitSearch}/>
       <Route path=":id" component={BitEditor} />
       <Route path="new" component={BitEditor} />
     </Route>
    </Route>
  </Router>,
  document.getElementById('root')
);