// @refresh reset
import { View, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import { auth, db } from "../firebase";
import { useRoute } from "@react-navigation/native";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import Context from "../context/Context";
import { collection, doc, setDoc } from "firebase/firestore";

const randomId = nanoid();

export default function Chat() {
  const {
    theme: { colors },
  } = useContext(Context);

  const { currentUser } = auth;
  const route = useRoute();
  const room = route.params.room;
  const selectedImage = route.params.image;
  const userB = route.params.user;

  const senderUser = currentUser.photoURL
    ? {
        name: currentUser.displayName,
        _id: currentUser.uid,
        avatar: currentUser.photoURL,
      }
    : {
        name: currentUser.displayName,
        _id: currentUser.uid,
      };

  const roomId = room ? room.id : randomId;

  const roomRef = doc(db, "rooms", roomId);
  const roomMessagesRef = collection(db, "rooms", roomId, "messages");

  useEffect(() => {
    (async () => {
      if (!room) {
        const currentUserData = {
          displayName: currentUser.displayName,
          email: currentUser.email,
        };

        if (currentUser.photoURL) {
          currentUserData.photoURL = currentUser.photoURL;
        }

        const userBData = {
          displayName: userB.contactName || userB.displayName || "", //TODO: maybe anonymous
          email: userB.email,
        };

        if (userB.photoURL) {
          userBData.photoURL = userB.photoURL;
        }

        const roomData = {
          participants: [currentUserData, userBData],
          participantsArray: [currentUser.email, userB.email],
        };

        try {
          await setDoc(roomRef, roomData);
        } catch (error) {
          console.log(error);
        }
      }
    })();
  }, []);

  return (
    <View>
      <Text>Chat</Text>
    </View>
  );
}
