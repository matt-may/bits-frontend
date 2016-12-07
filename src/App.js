import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Infinite from 'react-infinite';
import './App.css';

const bits = [
  { body: 'My fair body' },
  { body: 'Hey there buddy'}
];

class SearchBar extends Component {
  render() {
    return (
      <div></div>
    );
  }
}

class BitEditor extends Component {
  render() {
    return (
      <div></div>
    );
  }
}

class BitPreview extends Component {
  render() {
    return (
      <div className="infinite-list-item">
        {this.props.body}
      </div>
    );
  }
}

class BitBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      elements: this.buildElements(0, 20),
      isInfiniteLoading: false
    };
  }

  buildElements(start, end) {
    var elements = [];

    for (var i = start; i < end; i++) {
      elements.push(<BitPreview key={i} num={i} body={bits[0].body}/>)
    }

    return elements;
  }

  handleInfiniteLoad = () => {
    var that = this;

    this.setState({
      isInfiniteLoading: true
    });

    setTimeout(function() {
      var elemLength = that.state.elements.length,
          newElements = that.buildElements(elemLength, elemLength + 1000);

      that.setState({
        isInfiniteLoading: false,
        elements: that.state.elements.concat(newElements)
      });
    }, 0);
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
      <Infinite elementHeight={40}
                containerHeight={250}
                infiniteLoadBeginEdgeOffset={200}
                onInfiniteLoad={this.handleInfiniteLoad}
                loadingSpinnerDelegate={this.elementInfiniteLoad()}
                isInfiniteLoading={this.state.isInfiniteLoading}>
        {this.state.elements}
      </Infinite>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="infinite">
          <BitBox />
        </div>
      </div>
    );
  }
}

export default App;