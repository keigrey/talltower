// @refresh reset
import { View, Text, ImageBackground } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useRoute } from "@react-navigation/native";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import Context from "../context/Context";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  where,
  addDoc,
  updateDoc,
} from "firebase/firestore";
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

  const [currentUserLanguage, setCurrentUserLanguage] = useState(null);
  const [userBLanguage, setUserBLanguage] = useState(null);

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
    const q = query(
      collection(db, "users"),
      where("uid", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        setCurrentUserLanguage(snapshot.docs[0].data().language);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("email", "==", userB.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        setUserBLanguage(snapshot.docs[0].data().language);
      }
    });
    return () => unsubscribe();
  }, []);

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

      appendMessages(messagesFirestore);
    });

    return () => unsubscribe();
  }, []);

  async function translate(textToTranslate) {
    const magicNumber = `${2 + 2}c${6 * 4}b${216 + 654}-f2fd-0a23-${
      3440 + 1639 + 3982
    }-${1286699455 * 2 * 2}dc:fx`;
    const sourceLanguage = currentUserLanguage;
    const targetLanguage = userBLanguage;
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

    return translatedText;
  }

  async function onSend(messagesNotTranslated = []) {
    const messages = await Promise.all(
      messagesNotTranslated.map(async (message) => {
        const translatedText = await translate(message.text);
        // const messageText = {
        //   originalMessage: message.text,
        //   translatedMessage: translatedText,
        // };
        // const messageText = [message.text, translatedText];
        // const messageText = `${translatedText}\n(${message.text})`;
        const messageText = `${translatedText}\n↳${message.text}`;

        message.text = messageText;

        return message;
      })
    );

    const writes = messages.map((message) => addDoc(roomMessagesRef, message));
    const lastMessage = messages[messages.length - 1];

    writes.push(updateDoc(roomRef, { lastMessage }));

    await Promise.all(writes);
  }

  useEffect(() => {
    console.log(messages[0]);
  }, [messages]);

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
