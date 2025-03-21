import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDszYjdGZjlXpTugq8bIveQKnaAkaJf36U",
    authDomain: "automatic-watering-syste-5f32e.firebaseapp.com",
    databaseURL: "https://automatic-watering-syste-5f32e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "automatic-watering-syste-5f32e",
    storageBucket: "automatic-watering-syste-5f32e.firebasestorage.app",
    messagingSenderId: "1036462601114",
    appId: "1:1036462601114:web:7ce676092d8cb9d9be4023",
    measurementId: "G-HMP9L9DZSV"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { database };
