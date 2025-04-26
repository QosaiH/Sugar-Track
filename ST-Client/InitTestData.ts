import { db } from "./fireBaseConfig";
import { doc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";

export const createTestData = async () => {
  // 1. יצירת 2 משתמשים
  await setDoc(doc(db, "users", "user1"), {
    id: "user1",
    displayName: "משתמש 1",
    email: "user1@example.com",
  
  });

  await setDoc(doc(db, "users", "user2"), {
    id: "user2",
    displayName: "משתמש 2",
    email: "user2@example.com",
  });

  // 2. יצירת קבוצת ניסוי
  await setDoc(doc(db, "chats", "group1"), {
    id: "group1",
    name: "קבוצת ניסוי",
    description: "זו קבוצת הניסוי שלנו",
    image: "https://placekitten.com/200/200",
    users: ["user1", "user2"],
    isGroup: true,
  });

  // 3. הודעה לדוגמה בקבוצה
  await addDoc(collection(db, "chats", "group1", "messages"), {
    senderId: "user1",
    text: "שלום לכולם!",
    timestamp: Timestamp.now(),
  });
};
