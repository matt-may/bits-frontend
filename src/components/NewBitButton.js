import React, { Component } from 'react';
import { Link } from 'react-router';

class NewBitButton extends Component {
  render() {
    return (
      <Link to={`/bits/new`} className='button button-outline'>Write New Bit</Link>
    );
  }
}

export default NewBitButton;