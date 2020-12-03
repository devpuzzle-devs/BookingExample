import React from "react";
import { Link } from "react-router-dom";

const Footer = React.memo(() => {
  return (
    <footer>
      <div className="overlay" />
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <img
              src="/img/logo-footer.png"
              className="d-inline-block float-left mr-3"
              alt=""
            />
          </div>
          <div className="col-md-4">
            <ul className="list-inline text-right">
              <li className="list-inline-item mr-5">
                <Link to="/about/privacy">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
