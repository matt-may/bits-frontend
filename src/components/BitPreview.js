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
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  openBit() {
    browserHistory.push(`/bits/${this.props.num}`);
  }

  handleClick = () => {
    this.props.onClick(this);
    this.openBit();
  }

  toggleActive() {
    this.mounted && this.setState((prevState) => {
      return { active: !prevState.active }
    });
  }

  render() {
    let className = 'card card-block card-preview';

    if (this.state.active)
      className += ' card-inverse';

    return (
      <div className='infinite-list-item'>
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