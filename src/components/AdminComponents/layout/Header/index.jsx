import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./style.scss";

const Header = props => {
  const [mobileNavOpened, toggleMobileNav] = useState(false);

  return (
    <div>
      {mobileNavOpened ? (
        <button
          className="mobile-nav-close"
          id="mobile-nav-close"
          onClick={() => {
            toggleMobileNav(!mobileNavOpened);
          }}
        >
          <i className="fas fa-times" />
        </button>
      ) : (
        <button
          className="mobile-nav-toggle"
          id="mobile-nav-toggle"
          onClick={() => {
            toggleMobileNav(!mobileNavOpened);
          }}
        >
          <i className="fas fa-bars" />
        </button>
      )}
      <div
        className={`mobile-nav ${mobileNavOpened ? "is-active" : ""}`}
        id="mobile-nav"
      >
        <div className="mobile-nav__inner" id="mobile-nav__inner">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="btn btn-outline btn-block mt-5 mb-4"
                to="/about"
                onClick={() => {
                  toggleMobileNav(!mobileNavOpened);
                }}
              >
                Home
              </Link>
            </li>
            {props.isLoggedIn ? (
              <React.Fragment>
                <li className="nav-item">
                  <Link
                    className="btn btn-outline btn-block mb-4"
                    to="/manage-events"
                    onClick={() => {
                      toggleMobileNav(!mobileNavOpened);
                    }}
                  >
                    Manage Events
                  </Link>
                </li>
              </React.Fragment>
            ) : null}
            <li className="nav-item">
              {props.isLoggedIn ? (
                <button
                  className="btn btn-outline btn-block mb-4"
                  onClick={() => {
                    props.handleLogout();
                  }}
                >
                  Sign out
                </button>
              ) : (
                <button
                  className="btn btn-outline btn-block mb-4"
                  onClick={() => {
                    props.onSignInClick();
                  }}
                >
                  Sign In
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
