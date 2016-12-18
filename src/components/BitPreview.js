import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class BitPreview extends Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = { active: false };
  }

  componentDidMount() {
    this.mounted = true;
    this.props.cbk(this);
  }

  componentWillUnmount() {
    this.mounted = false;
    //this.props.cbk(this);
  }

  openBit() {
    browserHistory.push(`/bits/${this.props.num}`);
  }

  handleClick = () => {
    this.props.onClick(this);
    this.openBit();
  }

  toggleActive() {
    //console.log('mounted state is ', this.mounted);
    this.mounted && this.setState((prevState) => {
      return { active: !prevState.active };
    });
  }

  setActive() {
    console.log('setting ', this.props.num, ' to active', '//mounted is ', this.mounted)
    this.mounted && this.setState((prevState) => {
      return { active: true };
    });
  }

  setInactive() {
    console.log('setting ', this.props.num, ' to inactive', '//mounted is ', this.mounted)
    this.mounted && this.setState((prevState) => {
      return { active: false };
    });
  }

  render() {
    let className = 'card card-block card-preview';

    if (this.state.active)
      className += ' card-inverse';

    return (
      <div className='infinite-list-item' ref={this.props.num} id={this.props.num}>
        <div onClick={this.handleClick} className={className}>
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
    );
  }
}

export default BitPreview;