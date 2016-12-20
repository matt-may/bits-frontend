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
    this.state = { active: false,
                   timeSinceUpdated: timeSince(this.props.updatedAt) };

    this.mounted = false;
    this.timerID = null;
  }

  componentDidMount() {
    this.mounted = true;
    this.props.onMount(this);
    this.startUpdateTimer();
  }

  startUpdateTimer() {
    this.timerID = setInterval(this.refreshUpdatedAt, UPDATE_INTERVAL);
  }

  refreshUpdatedAt() {
    this.setState({ timeSinceUpdated: timeSince(this.props.updatedAt) })
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
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
    if (!body || typeof body !== 'string')
      return 'Empty bit :-)';

    return body;
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
            <Dotdotdot clamp={3}>
              <p className='card-text'>
                <span dangerouslySetInnerHTML={{ __html: body }}></span>
              </p>
            </Dotdotdot>
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