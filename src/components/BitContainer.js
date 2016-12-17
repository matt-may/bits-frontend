import React, { Component } from 'react';

class BitContainer extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default BitContainer;
