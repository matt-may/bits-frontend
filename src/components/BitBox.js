import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Immutable from 'immutable';

import BitPreview from './BitPreview';
import InfiniteContainer from './InfiniteContainer';
import NoBitsBox from './NoBitsBox';
import constants from '../constants';
import { getFetch, parseJSON } from '../helpers';

import '../styles/other/infinite.css';

const WINDOW_SIZE_BREAKPOINT = 768;

/*
 Component to contain bit previews.

 If a search has been typed, the search is used to filter the previews. If
 no search has been typed, the user's bits are pulled in descending order.

 Fetches bit previews from the Rails backend, and renders them with draftJS.

*/
class BitBox extends Component {
  constructor(props) {
    super(props);

    // Initialize the editor disposition based on the window size - if full,
    // we open the editor and hide the other elements. If inline, we show the
    // editor side-by-side with the bit previews.
    const disposition = (this.props.windowWidth < WINDOW_SIZE_BREAKPOINT) ?
                        'full' : 'inline';

    this.state = { bits: Immutable.OrderedMap(), loading: false, page: 1,
                   numPages: 1, fetchType: 'index', activeBit: null,
                   activeBitID: null, disposition: disposition,
                   fetched: false };

    // Create our bit previews.
    this.buildPreviews();
  }

  /*
   Builds a map of bit previews for loading into an infinite scrolling
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
                   // to the bit index action or the search action.
        bitURI; // Our fetch URI.

    // If we have been given a query through our props, build the URI to
    // fetch from.
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
    .then(parseJSON)
    .then((body) => {
      // Construct our new previews.
      let bits = Immutable.OrderedMap(
        body.bits.map((bit) => {
          // When using the search endpoint, the body for the bit is actually
          // stored under the _source attribute, so account for that.
          const bitObj = bit._source ? bit._source : bit;
          const uniqueID = bitObj.unique_id;
          const body = bit.highlight ? bit.highlight.body[0] : bitObj.body;

          // Return a BitPreview.
          return [uniqueID, <BitPreview key={uniqueID} num={uniqueID}
                                        onClick={this.handleBitClick}
                                        onMount={this.resetActiveBit}
                                        activeBitID={this.state.activeBitID}
                                        body={body}
                                        updatedAt={bitObj.updated_at}/>];
        })
      );

      // Concatenate if necessary.
      if (concatBits)
        bits = this.state.bits.concat(bits);

      // Update state.
      this.setState({ bits: bits, loading: false, page: page,
                      numPages: body.num_pages, fetchType: fetchType,
                      fetched: true });
    });
  }

  // Resets the active bit to the one passed in. This is a callback executed
  // when BitPreviews are mounted. It is necessary because of how the Infinite
  // box works. BitPreviews for a given bit are instantiated and torn down
  // as the user scrolls. We want BitPreviews to tell us when they've mounted
  // so we can determine if the attached bit for the preview is the current
  // active bit. If so, we want to set it to active and reset the `activeBit`
  // in the state, which stores an actual reference to the BitPreview object.
  resetActiveBit = (bit) => {
    if (bit.props.num === this.state.activeBitID) {
      bit.setActive();
      this.setState({ activeBit: bit })
    }
  }

  // A callback that handles when a BitPreview is clicked. Retrieves the current
  // active bit and sets it to inactive, then sets the new bit to active and
  // updates the state.
  handleBitClick = (bit) => {
    if (this.state.activeBit)
      this.state.activeBit.setInactive();

    bit.setActive();
    this.openBit(bit.props.num);
    this.setState({ activeBit: bit, activeBitID: bit.props.num });
  }

  // Launches the 'show' page for the attached bit.
  openBit = (uniqueID) => {
    let path = `/bits/${uniqueID}`;

    if (this.state.disposition === 'full')
      path += '/full';

    browserHistory.push(path);
  }

  // A callback that handles the creation of a new bit, adding a BitPreview to
  // our list in the front position.
  handleBitCreate(uniqueID) {
    const newBits = Immutable.OrderedMap([[
      uniqueID,
      <BitPreview key={uniqueID} num={uniqueID}
                  onClick={this.handleBitClick}
                  onMount={this.resetActiveBit}
                  activeBitID={this.state.activeBitID}
                  body=''
                  updatedAt={new Date()}/>
    ]]).concat(this.state.bits);

    this.setState({ bits: newBits });
  }

  // A callback that handles the update of a new bit, updating the BitPreview
  // object in the list.
  handleBitUpdate(uniqueID, body) {
    const bits = this.state.bits;
    const newPreview = <BitPreview key={uniqueID} num={uniqueID}
                                   onClick={this.handleBitClick}
                                   onMount={this.resetActiveBit}
                                   activeBitID={this.state.activeBitID}
                                   body={body}
                                   updatedAt={new Date()}/>;
    const newBits = bits.set(uniqueID, newPreview);

    this.setState({ bits: newBits });
  }

  // Returns true if we have bits to show, else false. Assumes that if we
  // haven't yet fetched data, we will have bits to show.
  hasBits = () => {
    if (!this.state.fetched)
      return true;
    else
      return this.state.bits.size > 0;
  }

  // A callback that handles the delete of a new bit, deleting the BitPreview
  // object in the list.
  handleBitDelete = (uniqueID) => {
    const bits = this.state.bits;
    const newBits = bits.delete(uniqueID);
    this.setState({ bits: newBits });
  }

  handleWindowChange = (windowWidth) => {
    const disposition = (windowWidth < WINDOW_SIZE_BREAKPOINT) ?
                        'full' : 'inline';
    this.setState({ disposition: disposition });
  }

  // Called when new props are received.
  componentWillReceiveProps(nextProps) {
    const currentProps = this.props,
          query = nextProps.query,
          newBit = nextProps.newBit,
          updatedBit = nextProps.updatedBit,
          deletedBit = nextProps.deletedBit,
          windowWidth = nextProps.windowWidth;

    // If our query has changed,
    if (currentProps.query !== query)
      // Update our bit previews. Reset the pager to 1, since we'll be starting
      // with a brand new result set.
      this.buildPreviews({ nextProps: nextProps, newPage: 1 });

    // If a new bit has been created, execute a callback.
    if (currentProps.newBit !== newBit)
      this.handleBitCreate(newBit);

    // If a bit has been updated, execute a callback.
    if (currentProps.updatedBit.uniqueID !== updatedBit.uniqueID ||
         (currentProps.updatedBit.body !== updatedBit.body))
      this.handleBitUpdate(updatedBit.uniqueID, updatedBit.body);

    // If a bit has been deleted, handle it.
    if (currentProps.deletedBit !== deletedBit)
      this.handleBitDelete(deletedBit);

    if (currentProps.windowWidth !== windowWidth)
      this.handleWindowChange(windowWidth);
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
    const hasBits = this.hasBits();

    return (
      <div>
        {
          (hasBits)
          ? <InfiniteContainer handleScroll={this.handleScroll}
                               onInfiniteLoad={this.handleLoad}
                               loadingSpinnerDelegate={this.loadingElem()}
                              isInfiniteLoading={this.state.loading}>
              {this.state.bits.valueSeq()}
            </InfiniteContainer>
          : <NoBitsBox fetchType={this.state.fetchType}
                       disposition={this.state.disposition}
                       query={this.props.query}>
            </NoBitsBox>
        }
      </div>
    );
  }
}

export default BitBox;