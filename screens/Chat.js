// @refresh reset
import { View, Text, ImageBackground } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useRoute } from "@react-navigation/native";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import Context from "../context/Context";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import axios from "axios";

const randomId = nanoid();

export default function Chat() {
  const {
    theme: { colors },
  } = useContext(Context);

  const [roomHash, setRoomHash] = useState("");
  const [messages, setMessages] = useState([]);

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

      const emailHash = `${currentUser.email}:${userB.email}`;
      setRoomHash(emailHash);
    })();
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
    },
    [messages]
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(roomMessagesRef, (querySnapshot) => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        });

      appendMessages(messages);
    });

    return () => unsubscribe();
  }, []);

  async function translate(textToTranslate) {
    const magicNumber = `${2 + 2}c${6 * 4}b${216 + 654}-f2fd-0a23-${
      3440 + 1639 + 3982
    }-${1286699455 * 2 * 2}dc:fx`;
    const sourceLanguage = "JA";
    const targetLanguage = "RU";
    let optionsBody = [];

    const rawBody = {
      auth_key: magicNumber,
      text: textToTranslate,
      source_lang: sourceLanguage,
      target_lang: targetLanguage,
    };

    for (const property in rawBody) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(rawBody[property]);

      optionsBody.push(`${encodedKey}=${encodedValue}`);
    }

    optionsBody = optionsBody.join("&");

    const url = `https://api-free.deepl.com/v2/translate?${optionsBody}`;

    const response = await axios.post(url);

    const translatedText = response.data.translations[0].text;
    console.log(translatedText);
  }

  function onSend(messages) {
    const writes = messages.map(
      (message) => translate(message.text) /*console.log(message)*/
    );
  }

  return (
    <ImageBackground
      resizeMode="cover"
      source={require("../assets/chat-background.png")}
      style={{ flex: 1 }}
    >
      <GiftedChat
        onSend={onSend}
        messages={messages}
        user={senderUser}
        renderAvatar={null}
      />
    </ImageBackground>
  );
}
