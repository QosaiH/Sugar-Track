// app/index.js
import React from "react";
import Welcome from "./Welcome";
import BottomNav from "./BottomNav";
import { app, getAuth } from "../fireBaseConfig"; // Import your Firebase config
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  //return <BottomNav />;
  return <Welcome />;
  /* 
}
  const jsonData = require("./csvjson.json");
  const uploadToFirestore = async (data) => {
    try {
      for (const item of data) {
        const docRef = doc(collection(db, "user"), String(item.id));
        await setDoc(docRef, item);
      }
      console.log("All data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

  useEffect(() => {
    const checkAndUpload = async () => {
      const uploaded = await AsyncStorage.getItem("dataUploaded");
      if (uploaded !== "true") {
        await uploadToFirestore(jsonData);
        await AsyncStorage.setItem("dataUploaded", "true");
      }
    };
    checkAndUpload();
  }, []);
  */
}
