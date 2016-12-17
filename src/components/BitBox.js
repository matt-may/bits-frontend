import React, { Component } from 'react';
import Infinite from 'react-infinite';
import { Link } from 'react-router';

import BitPreview from './BitPreview';
import NewBitButton from './NewBitButton';
import constants from '../constants';
import { getFetch } from '../helpers';

import '../styles/other/infinite.css';

/*
 Component to contain bit previews.

 If a search has been typed, the search is used to filter the previews. If
 no search has been typed, the user's bits are pulled in descending order.

 Fetches bit previews from the Rails backend, and renders them with draftJS.

*/
class BitBox extends Component {
  constructor(props) {
    super(props);

    this.state = { bits: [], loading: false, page: 1, numPages: 1,
                   fetchType: 'index' };
    // Store a flag that will tell us whether we have to bits to show (if we
    // don't, we'll want to show a message instead). Assume we have bits,
    // so initialize to true.
    this.hasBits = true;
    // Create our bit previews.
    this.buildPreviews();
  }

  /*
   Builds a list of bit previews for loading into an infinite scrolling
   container.

   Params:
     `nextProps`: a props object, in case we need to have the latest props
                  passed in before they've actually updated,
     `newPage`: an integer page value, for paging through result lists from
                the backend,
     `concatBits`: whether to concatenate the bits that will be newly fetched
                   with the existing bits in the state.

  */
  buildPreviews({ nextProps = null,
                  newPage = null,
                  concatBits = false } = {}) {
    let props = nextProps || this.props,
        page  = newPage   || this.state.page,
        fetchType, // The type of fetch we'll be making to the backend - whether
                   // to the bit index action or the search action
        bitURI; // Our fetch URL

    // If we have been given a query through our props, build the URI to
    // fetch from
    if (props.query) {
      bitURI = `${constants.BITS_SEARCH_PATH}?q=${props.query}&page=${page}`;
      fetchType = 'search';
    }
    // If not, fetch from the bits index endpoint.
    else {
      bitURI = `${constants.BITS_PATH}?page=${page}`;
      fetchType = 'index';
    }

    // Fetch our new bits, build the bit previews if successful, and update
    // the state.
    getFetch(bitURI)
    .then((response) => {
      return response.json();
    })
    .then((body) => {
      // Construct our new previews.
      let newBits = body.bits.map((bit) => {
        // When using the search endpoint, the body for the bit is actually
        // stored under the _source attribute, so account for that.
        let bitBody = (bit._source) ? bit._source : bit;

        // Return a BitPreview.
        return <BitPreview key={bitBody.unique_id} num={bitBody.unique_id}
                           body={bitBody.body.slice(0,30)} />;
      });

      // Concatenate if necessary.
      if (concatBits)
        newBits = this.state.bits.concat(newBits);

      // Update the `hasBits` property indicating whether we have bits to show.
      this.hasBits = (newBits.length > 0);

      // Update state.
      this.setState({ bits: newBits, loading: false, page: page,
                      numPages: body.num_pages, fetchType: fetchType });
    });
  }

  // Called when new props are received.
  componentWillReceiveProps(nextProps) {
    // If our query has changed,
    if (this.props.query !== nextProps.query)
      // Update our bit previews. Reset the pager to 1, since we'll be starting
      // with a brand new result set.
      this.buildPreviews({ nextProps: nextProps, newPage: 1 });
  }

  // Called on infinite load.
  handleLoad = () => {
    this.setState((prevState) => {
      // Increment our pager.
      let newPage = prevState.page + 1;

      // If the new pager value is greater than the number of pages in the
      // result set, just return an empty object. We don't need to update the
      // state.
      if (newPage > prevState.numPages)
        return {};

      // Build new bit previews, updating the pager value and saying "yes" to
      // whether the new bits should be concatenated with the existing bit
      // list.
      this.buildPreviews({ concatBits: true, newPage: newPage });

      // Update our state to have loading be true.
      return { loading: true };
    });
  }

  // Shown when new elements are being loaded, specifically when 'loading'
  // is set to true in the state.
  loadingElem() {
    return (
      <div className='infinite-list-item'>
        Loading...
      </div>
    );
  }

  render() {
    return (
      <div>
        {
          (this.hasBits)
          ? <div className='infinite'>
              <Infinite elementHeight={86}
                        useWindowAsScrollContainer
                        infiniteLoadBeginEdgeOffset={200}
                        onInfiniteLoad={this.handleLoad}
                        loadingSpinnerDelegate={this.loadingElem()}
                        isInfiniteLoading={this.state.loading}>
                {this.state.bits}
              </Infinite>
            </div>
          : <p className='lead'>
              { (this.state.fetchType == 'index')
                ? <span>Welcome to Bits! <Link to='/bits/new'>Create your first bit</Link></span>
                : <span>No results for <u><em>{this.props.query}</em></u></span>
              }.
            </p>
        }
      </div>
    );
  }
}

export default BitBox;