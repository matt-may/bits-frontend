import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Navbar, Nav, NavItem, NavLink, Dropdown, DropdownToggle,
         DropdownMenu, DropdownItem } from 'reactstrap';

import constants from '../constants';
import { checkStatus, parseJSON, getFetch } from '../helpers';

class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = { name: '', image: '', dropdownOpen: false };
    this.buildHeader();
  }

  toggle = () => {
    this.setState((prevState) => {
      return { dropdownOpen: !prevState.dropdownOpen };
    });
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
      <Navbar color='faded' light>
        <Container>
          <Link to='/bits' className='navbar-brand'>Bits</Link>
          <Nav className='float-xs-right' navbar>
            <NavItem>
              <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret nav>
                  <img ref='profile-photo' src={this.state.image} width='50' height='50'
                       className='d-inline-block align-middle rounded-circle animated fadeIn'
                       alt='profile' />
                  <span ref='profile-name' className='user-name'>{this.state.name}</span>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem><NavLink href='/users/sign_out'>Sign Out</NavLink></DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>
    );
  }
}

export default AppHeader;