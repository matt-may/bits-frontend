import React, { Component } from 'react';
import { Link } from 'react-router';

class BitPreview extends Component {
  render() {
    return (
      <div className='infinite-list-item'>
        <blockquote>
          <p>
            <Link to={`/bits/${this.props.num}`}>
              {
                (this.props.body && this.props.body.length) ?
                 this.props.body :
                 'Empty bit :-)'
              }
            </Link>
          </p>
        </blockquote>
      </div>
    );
  }
}

export default BitPreview;