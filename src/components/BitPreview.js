import React, { Component } from 'react';
import { browserHistory } from 'react-router';

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

  render() {
    let className = 'card card-preview';

    // If the current object is active, add a special class.
    if (this.state.active)
      className += ' card-inverse';

    return (
      <div className='infinite-list-item' ref='card' id={this.props.num}>
        <div onClick={this.handleClick} className={className}>
          <div className='card-block'>
            <p className='card-text'>
              <span>
                {
                  (this.props.body && this.props.body.length)
                  ? this.props.body
                  : 'Empty bit :-)'
                }
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default BitPreview;