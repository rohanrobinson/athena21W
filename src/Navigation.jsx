import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import SearchBar from './SearchBar';
import "./navigation.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Dropdown from 'react-bootstrap/Dropdown';
import logo from "./images/athena-logo.png";
// import axios from 'axios';

class Navigation extends React.Component {
  state = {
    iconClicked: false
  };


  componentDidMount() {
  const config = {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token')
    }
  };

  }

  iconClicked = () => {
    if (this.state.iconClicked === false) {
      this.setState({
        iconClicked: true,
      });
  }
  else if (this.state.iconClicked === true) {
    this.setState({
      iconClicked: false,
    })
  }
}

  logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.setItem('user', '');
  }

  render() {
    if(sessionStorage.getItem("token")){
      return (
        <div className="navigation">
          <nav>
          <Link class="nav-link" to="/explore">
              <div class="navbar-brand" to="/">
                <img src="https://firebasestorage.googleapis.com/v0/b/athena-84a5c.appspot.com/o/Screen%20Shot%202021-05-19%20at%208.05.46%20AM.png?alt=media&token=5e9e25ef-ba06-472e-83a1-3aa76bad87e0" id="athena-logo" alt="athena-logo" />
                  Athena
              </div>
          </Link>
                <ul>
                  <li
                    class={`nav-item  ${
                      this.props.location.pathname === "/" ? "active" : ""
                    }`}
                  >
                    <Link class="nav-link" to="/explore">
                      Explore
                      <span class="sr-only">(current)</span>
                    </Link>
                  </li>
                  <li
                    class={`nav-item  ${
                      this.props.location.pathname === "/about" ? "active" : ""
                    }`}
                  >
                    <Link class="nav-link" to="/favorites">
                      My Favorites
                    </Link>
                  </li>
                  <li
                    class={`nav-item  ${
                      this.props.location.pathname === "/about" ? "active" : ""
                    }`}
                  >
                    <Link class="nav-link" to="/aboutus">
                      About Us
                    </Link>
                  </li>
                  <li
                    // class={`nav-item  ${
                    //   this.props.location.pathname === "/contact" ? "active" : ""
                    // }`}
                    className="icon-dropdown"
                  >
                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                      <FontAwesomeIcon icon={faUser} className="user_icon" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>

                        {/* <Dropdown.Item href="#/action-2"><Link className="nav-link"  to="/surveyInfo">Account Info</Link></Dropdown.Item> */}
                        {/* <Dropdown.Item href="#/action-1"><Link className="nav-link" onClick={() => this.logout()} to="/" >Log Out</Link></Dropdown.Item> */}

                         <Dropdown.Item href="#/action-2"><Link className="nav-link"  to="/surveyInfo">Account</Link></Dropdown.Item>
                         <Dropdown.Item href="#/action-1"><Link className="nav-link" onClick={() => this.logout()} to="/" ><span id="logout-text">Log Out</span></Link></Dropdown.Item>

                      </Dropdown.Menu>
                    </Dropdown>
                  </li>



                </ul>
          </nav>
        </div>
      )
    }
    else {
      return (
        <div className="navigation">
          <nav>
              <Link class="navbar-brand" to="/">
                Athena
              </Link>
                <ul>
                  <li
                    class={`nav-item  ${
                      this.props.location.pathname === "/contact" ? "active" : ""
                    }`}
                  >
                    <Link class="nav-link" to="/createAccount">
                      Sign Up
                    </Link>
                  </li>
                </ul>
          </nav>
        </div>
      );
    }
  }
}


export default withRouter(Navigation);