import React, { Component } from 'react';

class BitContainer extends Component {
  render() {
    return (
      <section>
        <h1>Bits</h1>
        <div>
          {this.props.children}
        </div>
      </section>
    );
  }
}

export default BitContainer;
