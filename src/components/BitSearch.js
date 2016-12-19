import React, { Component } from 'react';
import { StickyContainer, Sticky } from 'react-sticky';

import NewBitButton from './NewBitButton';
import BitBox from './BitBox';
import BitEditor from './BitEditor';

class BitSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '', newBit: null, deletedBit: null,
                   updatedBit: { uniqueID: null, body: null },
                   width: null, height: null };
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  handleBitCreate = (uniqueID) => {
    this.setState({ newBit: uniqueID });
  }

  handleBitUpdate = (uniqueID, body) => {
    this.setState({ updatedBit: { uniqueID: uniqueID, body: body } });
  }

  handleBitDelete = (uniqueID) => {
    this.setState({ deletedBit: uniqueID });
  }

  updateDimensions = () => {
    let w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0],
        width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;

        this.setState({ width: width, height: height });
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    // Grab our bit ID (if given) from query params.
    let bitID = this.props.params.bitID;
    // If no bit ID has been given, we'll set a flag telling our editor to
    // create a new bit.
    let newBit = bitID ? false : true;

    return (
      <div>
        <h1 className='mb-2'>My Bits</h1>
        <StickyContainer>
          <div className='row'>
            <div className='col-md-4'>
              <NewBitButton className='btn btn-secondary mb-1' />
              <div className='mb-1'>
                <input type='text' value={this.state.value} onChange={this.handleChange}
                       placeholder='Search your bits.' className='form-control' />
              </div>
              <BitBox query={this.state.value} newBit={this.state.newBit}
                      updatedBit={this.state.updatedBit}
                      deletedBit={this.state.deletedBit}
                      windowHeight={this.state.height}
                      windowWidth={this.state.width} />
            </div>
            <div className='col-md-8 hidden-sm-down'>
              <Sticky>
                <BitEditor newBit={newBit} bitID={bitID}
                           onBitCreate={this.handleBitCreate}
                           onBitUpdate={this.handleBitUpdate}
                           onBitDelete={this.handleBitDelete} />
              </Sticky>
            </div>
          </div>
        </StickyContainer>
      </div>
    );
  }
}

export default BitSearch;