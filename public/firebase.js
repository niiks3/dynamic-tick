// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM85etqfiokYqJMxIB83GrdrC5vgAUeY",
  authDomain: "finalvenety.firebaseapp.com",
  databaseURL: "https://finalvenety-default-rtdb.firebaseio.com",
  projectId: "finalvenety",
  storageBucket: "finalvenety.appspot.com",
  messagingSenderId: "756478174874",
  appId: "1:756478174874:web:bed0002edd754b88762123",
  measurementId: "G-XM4XMWMY3E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
