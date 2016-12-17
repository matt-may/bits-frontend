import React, { Component } from 'react';

import NewBitButton from './NewBitButton';
import BitBox from './BitBox';
import BitEditor from './BitEditor';

class BitSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
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
        <div className='row'>
          <div className='col-md-4'>
            <NewBitButton className='btn btn-outline-secondary mb-1' />
            <div className='mb-1'>
              <input type='text' value={this.state.value} onChange={this.handleChange}
                     placeholder='Search your bits.' className='form-control' />
            </div>
            <BitBox query={this.state.value} />
          </div>
          <div className='col-md-8'>
            <BitEditor newBit={newBit} bitID={bitID} />
          </div>
        </div>
      </div>
    );
  }
}

export default BitSearch;