import React, { Component } from 'react';
import { Link } from 'react-router';

class NoBitsMessage extends Component {
  render() {
    return (
      (this.props.disposition === 'inline')
      ? <p className='text-muted'>Simply start typing in the editor to the right
                                  to create your first bit.</p>
      : <Link to='/bits/new'>Create your first bit.</Link>
    );
  }
}

export default NoBitsMessage;