import { View, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import GlobalContext from "../context/Context";
import ContactsFloatingIcon from "../components/ContactsFloatingIcon";

export default function Chats() {
  const { rooms, setRooms } = useContext(GlobalContext);
  // TODO: rename to user for consistency
  const { currentUser } = auth;

  const chatsQuery = query(
    collection(db, "rooms"),
    where("participantsArray", "array-contains", currentUser.email)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const parsedChats = querySnapshot.docs
        .filter((doc) => doc.data().lastMessage)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          userB: doc
            .data()
            .participants.find((p) => p.email !== currentUser.email),
        }));
      setRooms(parsedChats);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        paddingRight: 10,
        backgroundColor: "skyblue",
      }}
    >
      <Text>Chats</Text>
      <ContactsFloatingIcon />
    </View>
  );
}
