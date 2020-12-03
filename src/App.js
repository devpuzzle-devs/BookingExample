import React, { Component } from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

import firebase, { db } from "./firebase.js";
import history from "./history";

import PrivateRoute from "./components/common/PrivateRoute";

import Navbar from "./components/layout/Navbar";
import Header from "./components/layout/Header";
import LoginForm from "./components/Login";

import Home from "./components/pages/Home";
import Story from "./components/pages/Story";
import Privacy from "./components/pages/Privacy";

import ManageEvents from "./components/ManageEvents";


import { AuthContext } from "./auth-context";

import "./scss/booking-example.scss";
import { WebApp } from './components/WebApp/WebApp';
import { TestUserContext } from './user-context.js';

let unsubscribe;

class App extends Component {
  state = {
    isLoggedIn: false,
    user: null,
    isLoginModalopen: false,
    isLoading: true,
    dbUser: {},
    testUser: {},
  };

  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      this.setState(
        {
          isLoggedIn: !!user,
          user,
          isLoginModalopen: false
        },
        () => {
          if (user) {
            this.loadDBUser().finally(() => {
              this.setState({ isLoading: false });
            });

            unsubscribe = db.collection('users').doc(user.uid).onSnapshot( 
              snapshot => {
                const newTestUser = {
                  ...snapshot.data(),
                  id: user.uid
                }
                this.setState({...this.state, testUser: newTestUser})
              })
          } else {
            this.setState({ isLoading: false });
          }
        }
      );
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  createUserDoc = (user, userNames) => {
    let userName = user.displayName
      ? user.displayName.toLowerCase().replace(/\s+/g, ".")
      : "";
    let counter = 1;
    let userNameBase = userName;
    while (userNames.indexOf(userName) > -1 || counter > 99) {
      userName = `${userNameBase}${("00" + counter).substr(-2)}`;
      counter++;
    }
    const userDoc = {
      adminFlag: false,
      coverImage: {},
      dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
      mostRecentOpenTSWeb: firebase.firestore.FieldValue.serverTimestamp(),
      numberOfAppOpenWeb: 0,
      kids: [],
      profileImage: {
        downloadURL: user.photoURL ? user.photoURL : "",
        storageLocation: "",
        storagePath: ""
      },
      savedEvents: [],
      userDefaultLocation: {},
      userEmail: user.email,
      userName: userName
    };

    return db
      .collection("users")
      .doc(user.uid)
      .set(userDoc)
      .then(() => {
        console.log("Document written with ID: ", user.uid);
        db.collection("userNameLookUp")
          .doc(user.uid)
          .set({ userName });
        return this.loadDBUser()
      })
      .catch(error => {
        console.error("Error adding document: ", error);
      });
  };

  loadUserNames = () => {
    return db
      .collection("userNames")
      .get()
      .then(querySnapshot => {
        const userNames = [];
        querySnapshot.forEach(doc => {
          userNames.push(doc.data().userName);
        });
        return userNames;
      })
      .catch(error => {
        console.log("Error getting documents: ", error);
      });
  };

  updateUserVisitInfo = (id, user) => {
      db.collection('users')
      .doc(id)
      .update('mostRecentOpenTSWeb', user.mostRecentOpenTSWeb, 'numberOfAppOpenWeb', user.numberOfAppOpenWeb)
      .catch( err => console.log('updateUserVisitInfo', err))
  }

  loadDBUser = () => {
    const { user } = this.state;

    return new Promise((resolve, _) => {

      db.collection("users")
        .doc(user.uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            const dbUser = doc.data();
            const { numberOfAppOpenWeb } = dbUser
            const newDBUser = {
              ...dbUser,
              mostRecentOpenTSWeb: firebase.firestore.FieldValue.serverTimestamp(),
              numberOfAppOpenWeb: numberOfAppOpenWeb && numberOfAppOpenWeb >= 0 ? numberOfAppOpenWeb + 1 : 1
            }

            this.updateUserVisitInfo(doc.id, newDBUser)

            dbUser.uid = doc.id;
            this.setState({ dbUser }, resolve);
          } else {
            this.loadUserNames()
              .then(userNames => {
                this.createUserDoc(user, userNames)
              })
              .then(resolve);
          }
        });
    });
  };

  handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        history.push("/");
      })
      .catch(() => {});
  };

  toggleLoginModal = () => {
    this.setState(prevState => ({
      isLoginModalopen: !prevState.isLoginModalopen
    }));
  };

  render() {
    const {isLoading, isLoggedIn} = this.state
    return (
      <Router history={history}>
        <div className="app">
        <TestUserContext.Provider value={this.state.testUser} >
          <AuthContext.Provider value={this.state.dbUser}>
            <div className="content">
              <Switch>

                <Route path="/about">
                    <Header
                      isLoggedIn={this.state.isLoggedIn}
                      handleLogout={this.handleLogout}
                      onSignInClick={this.toggleLoginModal}
                    />
                    <Navbar
                      onSignInClick={this.toggleLoginModal}
                      user={this.state.user}
                      handleLogout={this.handleLogout}
                    />
                    <Switch>
                      <Route path="/about" component={Home} exact />
                      <Route path="/about/our-story" component={Story} />
                      <Route path="/about/privacy" component={Privacy} />
                      <Route path="/about/event" render={() => <Redirect to="/about" />} />
                    </Switch>
                </Route>

                <PrivateRoute
                  path="/manage-events"
                  component={ ManageEvents }
                  loading={this.state.isLoading}
                  loggedIn={this.state.isLoggedIn}
                >
                  <Header
                    isLoggedIn={this.state.isLoggedIn}
                    handleLogout={this.handleLogout}
                    onSignInClick={this.toggleLoginModal}
                  />
                  <Navbar
                    onSignInClick={this.toggleLoginModal}
                    user={this.state.user}
                    handleLogout={this.handleLogout}
                  />
                </PrivateRoute>

                <Route path="/" >
                  <WebApp isLoading={isLoading} isLoggedIn={isLoggedIn} />
                </Route>

                <Route render={() => <Redirect to="/" />} />
              </Switch>

            </div>
            <Modal
              isOpen={this.state.isLoginModalopen}
              toggle={this.toggleLoginModal}
              className="login-modal"
            >
              <ModalHeader toggle={this.toggleLoginModal} />
              <ModalBody className="px-4">
                <LoginForm />
              </ModalBody>
            </Modal>
          </AuthContext.Provider>
          </TestUserContext.Provider>
        </div>
      </Router>
    );
  }
}

export default App;
