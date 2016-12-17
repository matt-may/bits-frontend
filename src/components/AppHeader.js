import React, { Component } from 'react';
import { Link } from 'react-router';

class AppHeader extends Component {

  https://graph.facebook.com/v2.6/583839545141065/picture?height=50&width=50'



  render() {
    return (
      <nav className='navbar navbar-fixed-top navbar-light bg-faded'>
        <div className='container'>
          <Link to='/bits' className='navbar-brand'>Bits</Link>
          <ul className='nav navbar-nav float-xs-right'>
            <li className='nav-item dropdown'>
              <a className='nav-link dropdown-toggle' id='supportedContentDropdown' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                <img ref='profile-photo' width='50' height='50' className='d-inline-block align-middle rounded-circle' alt='' />
                <span className='user-name'>Matt May</span>
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