import React, { Component } from 'react';

import NoBitsGreeting from './NoBitsGreeting';
import NoBitsMessage from './NoBitsMessage';
import NoBitsResults from './NoBitsResults';

class NoBitsBox extends Component {
  render() {
    return (
      <div>
        <NoBitsGreeting fetchType={this.props.fetchType}></NoBitsGreeting> {
          (this.props.fetchType === 'index')
          ? <NoBitsMessage disposition={this.props.disposition}></NoBitsMessage>
          : <NoBitsResults query={this.props.query}></NoBitsResults>
        }
      </div>
    );
  }
}

export default NoBitsBox;