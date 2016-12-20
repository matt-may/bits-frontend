import React, { Component } from 'react';

class NoBitsResults extends Component {
  render() {
    return <p>No results for <u><em>{this.props.query}</em></u>.</p>;
  }
}

export default NoBitsResults;