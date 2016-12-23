import React, { Component } from 'react';
import Dotdotdot from 'react-dotdotdot';

import { timeSince } from '../helpers';

const UPDATE_INTERVAL = 30000;

class BitPreview extends Component {
  constructor(props) {
    super(props);
    // The `active` state will track whether this BitPreview is the current
    // active preview in the list. `timeSinceUpdated` stores the time since the
    // bit was last updated, in words.
    this.state = { active: false, timeSinceUpdated: this.timeSinceUpdated() };
    this.mounted = false;
    this.timerID = null;
  }

  componentDidMount() {
    this.mounted = true;
    this.props.onMount(this);
    this.startUpdateTimer();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updatedAt !== nextProps.updatedAt) {
      this.clearUpdateTimer();
      this.refreshUpdatedAt(nextProps.updatedAt);
      this.startUpdateTimer();
    }
  }

  startUpdateTimer() {
    this.timerID = setInterval(() => {
      this.refreshUpdatedAt()
    }, UPDATE_INTERVAL);
  }

  clearUpdateTimer() {
    clearInterval(this.timerID);
  }

  refreshUpdatedAt(updatedAt) {
    this.setState({
      timeSinceUpdated: this.timeSinceUpdated(updatedAt || this.props.updatedAt)
    });
  }

  timeSinceUpdated(updatedAt) {
    return timeSince(updatedAt || this.props.updatedAt);
  }

  componentWillUnmount() {
    this.clearUpdateTimer();
    this.mounted = false;
  }

  // Executes a given callback when the preview is clicked.
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

  // Formats the bit body for display.
  formatBody(body) {
    if (!body || !(/\S/.test(body)) || typeof body !== 'string')
      return 'Empty bit :-)';

    const nonWhitespace = body.search(/\S/)
    const substring = body.substring(nonWhitespace);
    const nextNewline = substring.indexOf('\n');

    if (nextNewline === -1) {
      return (
        <Dotdotdot clamp={2}>
          <p className='card-text'>{body}</p>
        </Dotdotdot>
      );
    }
    else {
      const firstSlice = body.slice(nonWhitespace, nextNewline + nonWhitespace);
      const secondSlice = body.slice(nextNewline + nonWhitespace, body.length);

      return (
        <div>
          <Dotdotdot clamp={1}>
            <p className='card-text'>{firstSlice}</p>
          </Dotdotdot>
          <Dotdotdot clamp={1}>
            <p className='card-text'>{secondSlice}</p>
          </Dotdotdot>
        </div>
      );
    }
  }

  render() {
    let className = 'card card-preview';

    // If the current object is active, add a special class.
    if (this.state.active)
      className += ' card-active';

    // Slice the body text for display.
    const body = this.formatBody(this.props.body);

    return (
      <div className='infinite-list-item' ref='card' id={this.props.num}>
        <div onClick={this.handleClick} className={className}>
          <div className='card-block'>
            {body}
          </div>
          <div className='card-footer text-muted sans-serif'>
            Updated {this.state.timeSinceUpdated}
          </div>
        </div>
      </div>
    );
  }
}

export default BitPreview;