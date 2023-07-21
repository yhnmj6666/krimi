import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
const config = {
  apiKey: "AIzaSyDQKeqPh46LhFr2z-BAoxgj6xBEbsMeEqo",
  authDomain: "criminal-minds.firebaseapp.com",
  databaseURL: "https://criminal-minds.firebaseio.com",
  projectId: "criminal-minds",
  storageBucket: "criminal-minds.appspot.com",
  messagingSenderId: "744849447046",
  appId: "1:744849447046:web:b7d547afee68c2c96ed907"
};
config;
const app = initializeApp(config);

export default getDatabase(app);
