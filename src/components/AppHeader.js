import React, { Component } from 'react';
import { Link } from 'react-router';

import constants from '../constants';
import { checkStatus, parseJSON, getFetch } from '../helpers';

class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = { name: '', image: '' };
    this.buildHeader();
  }

  // Fills in the user's name and profile image in our header.
  buildHeader() {
    getFetch(constants.USER_SHOW_PATH)
    .then(checkStatus)
    .then(parseJSON)
    .then((body) => {
      this.setState({ name: body.name, image: body.image });
    });
  }

  render() {
    return (
      <nav className='navbar navbar-fixed-top navbar-light bg-faded'>
        <div className='container'>
          <Link to='/bits' className='navbar-brand'>Bits</Link>
          <ul className='nav navbar-nav float-xs-right'>
            <li className='nav-item dropdown'>
              <a className='nav-link dropdown-toggle' id='supportedContentDropdown' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                <img ref='profile-photo' src={this.state.image} width='50' height='50' className='d-inline-block align-middle rounded-circle animated fadeIn' alt='' />
                <span ref='profile-name' className='user-name'>{this.state.name}</span>
              </a>
              <div className='dropdown-menu' aria-labelledby='supportedContentDropdown'>
                <a className='dropdown-item' href='#'>Sign out</a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default AppHeader;