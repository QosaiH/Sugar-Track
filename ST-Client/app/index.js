// app/index.js
import React from "react";
import Welcome from "./Welcome";
import BottomNav from "./BottomNav";
import { app, getAuth, db } from "../fireBaseConfig"; // Import your Firebase config
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, collection, setDoc, getDoc } from "firebase/firestore"; // Ensure you import getDoc
import { useEffect } from "react";

export default function App() {
  //return <BottomNav />;
  return <Welcome />;
}
/*
 const jsonData = require("./csvjson.json");
 console.log("jsonData");
 const uploadToFirestore = async (data) => {
   console.log("jsonData2");

   try {
     for (const item of data) {
       const docRef = doc(collection(db, "user"), String(item.id));
       const docSnapshot = await getDoc(docRef); // Check if the document exists

       if (!docSnapshot.exists()) {
         // If the document does not exist, upload it
         await setDoc(docRef, item);
         console.log(`Uploaded user with ID: ${item.id}`);
       } else {
         console.log(
           `User  with ID: ${item.id} already exists. Skipping upload.`
         );
       }
     }
     console.log("All data processed successfully!");
   } catch (error) {
     console.error("Error uploading data:", error);
   }
 };

 useEffect(() => {
   const checkAndUpload = async () => {
     console.log("jsonData1");

     await uploadToFirestore(jsonData);
   };
   checkAndUpload();
 }, []);
*/
