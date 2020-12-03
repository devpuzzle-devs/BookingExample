import React from "react";
import { Route, Redirect } from "react-router-dom";

import Spinner from "../Spinner";

const PrivateRoute = ({ component: Component, loggedIn, loading, children, ...rest }) =>
  !loading ? (
    <Route
      {...rest}
      render={props =>
        loggedIn === true ? (
          <>
            {children}
            <Component {...props} />
          </>
        ) : (
          <Redirect to={{ pathname: "/", state: { from: props.location } }} />
        )
      }
    />
  ) : (
    <Spinner />
  );

export default PrivateRoute;
