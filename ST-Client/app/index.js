// app/index.js
import React, { useEffect } from "react";
import Welcome from "./Welcome";
import BottomNav from "./BottomNav";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../fireBaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  return <Welcome />;
  //return <BottomNav />;

  /* {
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
}
  */
}
