import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/analytics'

  const prodConfig = {
    apiKey: process.env.PROD_API_KEY,
    authDomain: process.env.PROD_AUTH_DOMAIN,
    databaseURL: process.env.PROD_DB_URL,
    projectId: process.env.PROD_PROJECT_ID,
    storageBucket: process.env.PROD_STORAGE_BUCKET,
    messagingSenderId: process.env.PROD_MESSAGE_SEND_ID,
    appId: process.env.PROD_APP_ID,
    measurementId: process.env.PROD_MEASUREMENT_ID
  };

  const devConfig = {
    apiKey: process.env.DEV_API_KEY,
    authDomain: process.env.DEV_AUTH_DOMAIN,
    databaseURL: process.env.DEV_DB_URL,
    projectId: process.env.DEV_PROJECT_ID,
    storageBucket: process.env.DEV_STORAGE_BUCKET,
    messagingSenderId: process.env.DEV_MESSAGE_SEND_ID,
    appId: process.env.DEV_APP_ID,
    measurementId: process.env.DEV_MEASUREMENT_ID
  };
  const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

  firebase.initializeApp(config);
  const analytics = firebase.analytics().logEvent('notification_received')

  const storage = firebase.storage();
  const db = firebase.firestore();
  const providerFacebook = new firebase.auth.FacebookAuthProvider();
  const providerGoogle = new firebase.auth.GoogleAuthProvider();

  const FB_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.PROD_FB_BASE_URL
    : process.env.DEV_FB_BASE_URL

  export {
    storage,
    db,
    providerFacebook,
    providerGoogle,
    FB_BASE_URL,
    firebase as default
}
