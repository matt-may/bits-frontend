import React, { Component } from 'react';
import Infinite from 'react-infinite';

const elemHeight = 135;
const infiniteLoadBeginEdgeOffset = elemHeight * 2.5;

class InfiniteContainer extends Component {
  render() {
    return (
      <div className='container-infinite animated fadeIn'>
        <Infinite elementHeight={elemHeight}
                  useWindowAsScrollContainer={true}
                  infiniteLoadBeginEdgeOffset={infiniteLoadBeginEdgeOffset}
                  handleScroll={this.props.handleScroll}
                  onInfiniteLoad={this.props.onInfiniteLoad}
                  loadingSpinnerDelegate={this.props.loadingSpinnerDelegate}
                  isInfiniteLoading={this.props.isInfiniteLoading}>
          {this.props.children}
        </Infinite>
      </div>
    );
  }
}

export default InfiniteContainer;