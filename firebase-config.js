// Firebase CDN scripts must be loaded before this file
const firebaseConfig = {
  apiKey: "AIzaSyA8kzfSjRg2kqJw2SB46Mp3jHoI7Kt3Y4c",
  authDomain: "bp-studios-176d2.firebaseapp.com",
  projectId: "bp-studios-176d2",
  storageBucket: "bp-studios-176d2.firebasestorage.app",
  messagingSenderId: "195228488571",
  appId: "1:195228488571:web:738e5ac560d98927f763de"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();