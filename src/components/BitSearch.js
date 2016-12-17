import React, { Component } from 'react';

import NewBitButton from './NewBitButton';
import BitBox from './BitBox';

class BitSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <div>
        <NewBitButton />
        <div>
          <input type='text' value={this.state.value} onChange={this.handleChange}
                 placeholder='Search your bits.' className='form-control' />
        </div>
        <BitBox query={this.state.value} />
      </div>
    );
  }
}

export default BitSearch;