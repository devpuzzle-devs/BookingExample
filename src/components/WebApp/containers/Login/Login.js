import firebase, { providerFacebook, providerGoogle } from '../../../../firebase';
import history from "../../../../history";

export const facebookLogin = () => {
        return firebase.auth().signInWithPopup(providerFacebook)
}

export const googleLogin = () => {
        return firebase.auth().signInWithPopup(providerGoogle);
}

export const logOut = () => {
        firebase
                .auth()
                .signOut()
                .then(() => {
                        // Sign-out successful.
                        history.push("/");
                })
                .catch(() => { debugger });
};