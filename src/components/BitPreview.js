import React, { Component } from 'react';

import { timeSince } from '../helpers';

const SLICE_END_INDX = 53;

class BitPreview extends Component {
  constructor(props) {
    super(props);
    // Keep tracking of whether the component is mounted, or subsequent
    // method invocations that require state changes.
    this.mounted = false;

    // The active state will track whether this BitPreview is the current
    // active preview in the list.
    this.state = { active: false };
  }

  componentDidMount() {
    this.mounted = true;

    // Execute the given callback, passing in the current object.
    this.props.onMount(this);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  // Executes a given callback, and makes a call to openBit.
  handleClick = () => {
    this.props.onClick(this);
  }

  // Sets the current object to active if the component is mounted.
  setActive() {
    this.mounted && this.setState((prevState) => {
      return { active: true };
    });
  }

  // Sets the current object to inactive if the component is mounted.
  setInactive() {
    this.mounted && this.setState((prevState) => {
      return { active: false };
    });
  }

  // Slices a string of text up to a given index for previews.
  sliceBody(body) {
    if (!body || typeof body !== 'string')
      return 'Empty bit :-)';

    let slice = body.slice(0, SLICE_END_INDX);

    if (slice.length < body.length)
      slice += '...';

    return slice;
  }

  // Determines if an ellipsis is needed when truncating `fullBody` to
  // `slicedBody` for showing in a preview. Returns true if yes, else false.
  needsEllipsis(slicedBody, fullBody) {
    return slicedBody.length < fullBody.length;
  }

  render() {
    let className = 'card card-preview';

    // If the current object is active, add a special class.
    if (this.state.active)
      className += ' card-active';

    // Slice the body text for display.
    const slicedBody = this.sliceBody(this.props.body);

    return (
      <div className='infinite-list-item' ref='card' id={this.props.num}>
        <div onClick={this.handleClick} className={className}>
          <div className='card-block'>
            <p className='card-text'>
              <span dangerouslySetInnerHTML={{__html: slicedBody}}>
              </span>
            </p>
          </div>
          <div className='card-footer text-muted sans-serif'>
            Updated {timeSince(this.props.updatedAt)}
          </div>
        </div>
      </div>
    );
  }
}

export default BitPreview;