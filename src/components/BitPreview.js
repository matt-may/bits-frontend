import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class BitPreview extends Component {
  openBit = (e) => {
    browserHistory.push(`/bits/${this.props.num}`);
  }

  render() {
    return (
      <div className='infinite-list-item'>
        <div onClick={this.openBit} className='card card-block card-preview'>
          <p className='card-text'>
            <span>
              {
                (this.props.body && this.props.body.length)
                ? this.props.body
                : 'Empty bit :-)'
              }
            </span>
          </p>
        </div>
      </div>
    );
  }
}

export default BitPreview;