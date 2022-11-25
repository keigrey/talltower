import { View, Text, FlatList } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import useContacts from "../hooks/useHooks";
import ListItem from "../components/ListItem";
import GlobalContext from "../context/Context";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useRoute } from "@react-navigation/native";

function ContactPreview({ contact, image }) {
  const { unfilteredRooms } = useContext(GlobalContext);
  const [user, setUser] = useState(contact);
  // NEW VARIABLE

  useEffect(() => {
    // TODO: instead of query can try to access the document directly
    const q = query(
      collection(db, "users"),
      where("email", "==", contact.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        const userDoc = snapshot.docs[0].data();

        // TODO: change to (...user, userDoc)
        setUser((prevUser) => ({ ...prevUser, userDoc }));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ListItem
      type="contacts"
      user={user}
      image={image}
      room={unfilteredRooms.find((room) =>
        room.participantsArray.includes(contact.email)
      )}
      style={{ marginTop: 7 }}
    />
  );
}

export default function Contacts() {
  const contacts = useContacts();
  const route = useRoute();
  const image = route.params && route.params.image;

  return (
    <FlatList
      style={{ flex: 1, padding: 10 }}
      data={contacts}
      keyExtractor={(_, i) => i}
      renderItem={({ item }) => <ContactPreview contact={item} image={image} />}
    />
  );
}
