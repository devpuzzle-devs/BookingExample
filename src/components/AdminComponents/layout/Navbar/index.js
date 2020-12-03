import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";

class Navbar extends Component {
  render() {
    const { user } = this.props;

    return (
      <nav className="navbar navbar-expand-lg navbar-light" id="mainNav">
        <div className="container">
          <Link className="navbar-brand js-scroll-trigger" to="/">
            <img className="logo" src="/img/logo.png" alt="Logo" />
          </Link>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink className="btn btn-outline-primary" to="/" exact>
                  Home
                </NavLink>
              </li>
              {user ? (
                <li className="nav-item">
                  <NavLink
                    className="btn btn-outline-primary"
                    to="/manage-events"
                  >
                    Create/Manage Event
                  </NavLink>
                </li>
              ) : (
                <li className="nav-item">
                  <button
                    className="btn btn-outline-primary"
                    onClick={this.props.onSignInClick}
                  >
                    Create/Manage Event
                  </button>
                </li>
              )}
            </ul>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                {user ? (
                  <React.Fragment>
                    <button
                      className="btn btn-outline-primary"
                      onClick={this.props.handleLogout}
                    >
                      Sign Out
                    </button>
                    {user.photoURL ? (
                      <img
                        className="avatar rounded-circle ml-3"
                        style={{width: '30px'}}
                        src={user.photoURL}
                        alt=""
                      />
                    ) : (
                      <div
                        className="d-inline-block avatar-wrapper"
                        style={{ maxWidth: "46px" }}
                      >
                        <img
                          src="/img/logo-footer.png"
                          className="img-fluid avatar ml-3"
                          alt=""
                        />
                      </div>
                    )}
                  </React.Fragment>
                ) : (
                  <button
                    className="btn btn-outline-primary"
                    onClick={this.props.onSignInClick}
                  >
                    Sign In
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
