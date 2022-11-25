import { View, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import GlobalContext from "../context/Context";
import ContactsFloatingIcon from "../components/ContactsFloatingIcon";
import ListItem from "../components/ListItem";
import useContacts from "../hooks/useHooks";

export default function Chats() {
  const {
    theme: { colors },
  } = useContext(GlobalContext);

  const { rooms, setRooms, setUnfilteredRooms } = useContext(GlobalContext);
  // TODO: rename to user for consistency
  const { currentUser } = auth;
  const contacts = useContacts();

  const chatsQuery = query(
    collection(db, "rooms"),
    where("participantsArray", "array-contains", currentUser.email)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const parsedChats = querySnapshot.docs
        // .filter((doc) => doc.data().lastMessage)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          userB: doc
            .data()
            .participants.find((p) => p.email !== currentUser.email),
        }));
      setUnfilteredRooms(parsedChats);
      // TODO: FIX ERROR
      setRooms(parsedChats.filter((doc) => doc.lastMessage));
    });

    return () => unsubscribe();
  }, []);

  function getUserB(user, contacts) {
    const userContact = contacts.find(
      (contact) => contact.email === user.email
    );

    if (userContact && userContact.contactName) {
      return { ...user, contactName: userContact.contactName };
    }

    return user;
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        paddingRight: 10,
        backgroundColor: colors.background,
      }}
    >
      {rooms.map((room) => (
        <ListItem
          type="chat"
          description={
            room.lastMessage.text.length > 35
              ? `${room.lastMessage.text.substring(0, 35)}...`
              : `${room.lastMessage.text.substring(0, 35)}`
          }
          key={room.id}
          room={room}
          time={room.lastMessage.createdAt}
          user={getUserB(room.userB, contacts)}
          style={{ color: "white" }}
        />
      ))}
      <ContactsFloatingIcon />
    </View>
  );
}
