import React, { Component, Suspense } from "react";
import { Route, NavLink, Switch, Redirect } from "react-router-dom";
import axios from "axios";
import { TabContent, TabPane, Nav, NavItem } from "reactstrap";

import firebase from "../../firebase";

import "./style.scss";
import { AuthContext } from "../../auth-context";

const UpcomingEventsTable = React.lazy( async () =>  import('./UpcomingEventsTable'))
const ArchiveEventsTable = React.lazy( async () =>  import('./ArchiveEventsTable'))

axios.interceptors.request.use(
  async config => {
    config.headers.authorization =
      "Bearer " + (await firebase.auth().currentUser.getIdToken());
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

class ManageEvents extends Component {
  render() {
    const user = this.context;

    return (
      <div className="manage-events">
        <Nav className="manage-events-tabs" tabs>
          <NavItem>
            <NavLink
              exact
              to={`${this.props.match.url}/upcoming`}
              className="nav-link"
            >
              Upcoming events
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              to={`${this.props.match.url}/archived`}
              className="nav-link"
            >
              Archived events
            </NavLink>
          </NavItem>
          {user.adminFlag && (
            <NavItem>
              <NavLink
                to={`${this.props.match.url}/staging`}
                className="nav-link"
              >
                Staging
              </NavLink>
            </NavItem>
          )}
        </Nav>

        <TabContent activeTab="1">
          <TabPane tabId="1">
            <Switch>
              <Redirect
                exact
                from={`${this.props.match.url}/`}
                to={`${this.props.match.url}/upcoming`}
              />
              <Route
                path={`${this.props.match.url}/upcoming`}
              component={UpcomingEventsTable}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <UpcomingEventsTable />
                </Suspense>
              </Route>
              
              <Route
                path={`${this.props.match.url}/staging`}
              component={StagingTable}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <StagingTable />
                </Suspense>
              </Route>
              
              <Route
                path={`${this.props.match.url}/archived`}
              component={ArchiveEventsTable}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <ArchiveEventsTable />
                </Suspense>
              </Route>
              <Redirect to="/" />
            </Switch>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

ManageEvents.contextType = AuthContext;

export default ManageEvents;
