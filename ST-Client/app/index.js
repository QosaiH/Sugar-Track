// app/index.js
import React from "react";
import Welcome from "./Welcome"; // Adjust the path if necessary
import BottomNav from "./BottomNav";
import { app, getAuth } from "../fireBaseConfig"; // Import your Firebase config
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  return <BottomNav />;
  //return <Welcome />;
}
