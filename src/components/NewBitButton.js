import React, { Component } from 'react';
import { Link } from 'react-router';

class NewBitButton extends Component {
  render() {
    return (
      <Link to='/bits/new' className={this.props.className}>
        {(this.props.children) ? this.props.children : 'Write New Bit'}
      </Link>
    );
  }
}

export default NewBitButton;