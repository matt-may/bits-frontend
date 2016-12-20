import React, { Component } from 'react';

class NoBitsGreeting extends Component {
  render() {
    return (
      (this.props.fetchType === 'index')
      ? <p className='d-inline-block'>Welcome to Bits!</p>
      : <span></span>
    );
  }
}

export default NoBitsGreeting;