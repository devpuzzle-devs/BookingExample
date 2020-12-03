import React, { Component } from 'react';
import firebase, {providerFacebook} from '../../../firebase.js';
import { UncontrolledTooltip } from 'reactstrap';

class LoginForm extends Component {
    state = {
        email: '',
        password: '',
        error : {}
    }

    handleInputChange = e => {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleLogin = (e) => {
        e.preventDefault();
        this.setState({error: {}});

        firebase.auth().signInWithPopup(providerFacebook)
        .then((result) => {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // var token = result.credential.accessToken;
            // // The signed-in user info.
            // var user = result.user;
            // ...
        }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            // var email = error.email;
            // // The firebase.auth.AuthCredential type that was used.
            // var credential = error.credential;
            this.setState({error})
            // ...
            console.log(errorCode,errorMessage)
        });
    }

    handleSignUp = () => {
        const {email, password} = this.state;
        this.setState({error: {}});

        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((result) => {
            // var token = result.user.refreshToken;
            // // The signed-in user info.
            // var user = result.user;
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            this.setState({error})
            // ...
            console.log(errorCode,errorMessage)
        });
    }

    handleSignIn = (e) => {
        e.preventDefault();
        const {email, password} = this.state;

        this.setState({error: {}});

        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((result) => {
            // var token = result.user.refreshToken;
            // // The signed-in user info.
            // var user = result.user;
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode,errorMessage)
            this.setState({error})
            // ...
        });
    }

    render() {
        return (<form onSubmit={this.handleSignIn}>
            <div className="form-group">
                <button className="btn btn-facebook btn-block mb-3" onClick={this.handleLogin}><i className="fab fa-facebook-f"></i> Continue with Facebook</button>
            </div>
            <div className="text-center mb-1">
                <span className="small">or</span>
            </div>
            <div className="form-group">
                <input type="text" className="form-control" placeholder="Email" name="email" value={this.state.email} onChange={this.handleInputChange} />
            </div>
            <div className="form-group">
                <input type="password" className="form-control" placeholder="Password" name="password" value={this.state.password} onChange={this.handleInputChange}/>
                <span id="forgotPasswordText" className="small"><u>Forgot password?</u></span>
                <UncontrolledTooltip placement="right" target="forgotPasswordText">
                    Please go to iOS app sign in screen to reset password.
                </UncontrolledTooltip>
            </div>

            <div className="form-group">
                <button className="btn btn-primary btn-block" onClick={this.handleSignIn}>Sign In</button>
            </div>
            <div className="form-group">
                <span id="signUpText" className="small text-center"><u>Sign Up</u></span>
                <UncontrolledTooltip placement="right" target="signUpText">
                    Please go to iOS app to sign up.
                </UncontrolledTooltip>
                {/* <button className="btn btn-outline btn-block" onClick={this.handleSignUp}>Sign Up</button> */}
            </div>
            {this.state.error && this.state.error.message && <div className="alert alert-danger">{this.state.error.message}</div>}
        </form>)
    }
}

export default LoginForm;
