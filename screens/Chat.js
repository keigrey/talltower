// @refresh reset
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
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
import {
  Actions,
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
  Composer,
} from "react-native-gifted-chat";
import axios from "axios";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { askForPermission, pickImage, uploadImage } from "../utils";

const randomId = nanoid();

export default function Chat() {
  const {
    theme: { colors },
  } = useContext(Context);

  const { height, width } = useWindowDimensions();

  const [roomHash, setRoomHash] = useState("");
  const [messages, setMessages] = useState([]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardOpen(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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

  async function sendImage(uri, roomPath) {
    const { url, fileName } = await uploadImage(
      uri,
      `images/rooms/${roomPath || roomHash}`,
      fileName
    );

    const message = {
      _id: fileName,
      text: "",
      createdAt: new Date(),
      user: senderUser,
      image: url,
    };

    const lastMessage = { ...message, text: "Image" };

    await Promise.all([
      addDoc(roomMessagesRef, message),
      updateDoc(roomRef, { lastMessage }),
    ]);
  }

  async function handlePhotoPicker() {
    const permissionStatus = await askForPermission();
    if (permissionStatus === "granted") {
      const result = await pickImage();
      if (!result.cancelled) {
        await sendImage(result.uri);
      }
    }
  }

  const styles = StyleSheet.create({
    mainView: { flex: 1, backgroundColor: colors.background },
    attachActionIcon: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.textInput,
      height: 50,
      width: 50,
      borderRadius: 50,
      marginBottom: 0,
      marginLeft: 0,
      ...Platform.select({
        ios: {
          height: 40,
          width: 40,
          borderRadius: 40,
        },
      }),
      // position: "absolute",
      // right: 50,
      // bottom: 5,
      // zIndex: 9999,
    },
    inputToolbar: {
      backgroundColor: "transparent",
      paddingLeft: 5,
      paddingRight: 3,
      marginRight: 0,
      borderTopWidth: 0,
    },
    sendButton: {
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      width: 50,
      borderRadius: 50,
      backgroundColor: colors.textInput,
      ...Platform.select({
        ios: {
          height: 40,
          width: 40,
          borderRadius: 40,
        },
      }),
    },
    textInput: {
      color: colors.textLight,
      backgroundColor: colors.textInput,
      borderRadius: 50,
      paddingLeft: 15,
      paddingRight: 15,
      marginRight: 0,
      marginLeft: 6,
      marginBottom: 0,
      marginTop: 0,
      ...Platform.select({
        ios: {
          paddingTop: 12.5,
        },
      }),
    },
  });

  return (
    <View style={styles.mainView}>
      {/* <ImageBackground
        resizeMode="cover"
        source={require("../assets/chat-background.png")}
        style={{ flex: 1 }}
      > */}
      <GiftedChat
        onSend={onSend}
        messages={messages}
        user={senderUser}
        renderAvatar={null}
        wrapInSafeArea={false}
        alwaysShowSend={true}
        timeTextStyle={{
          right: { color: colors.textTime },
          left: { color: colors.textTime },
        }}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            primaryStyle={{
              marginBottom: Platform.OS === "ios" ? 23 : 10,
            }}
            renderSend={(props) => {
              const { text, messageIdGenerator, user, onSend } = props;
              return (
                <Send {...props}>
                  <View style={styles.sendButton}>
                    <MaterialCommunityIcons
                      name="send"
                      size={24}
                      color={text ? colors.accent : colors.inactive}
                    />
                  </View>
                </Send>
              );
            }}
            renderComposer={(props) => (
              <Composer
                {...props}
                placeholder="Message"
                composerHeight={Platform.OS === "ios" ? 40 : 50}
                textInputStyle={styles.textInput}
              />
            )}
            renderActions={(props) => (
              <Actions
                {...props}
                containerStyle={styles.attachActionIcon}
                onPressActionButton={handlePhotoPicker}
                icon={() => (
                  <AntDesign name="paperclip" size={24} color={colors.accent} />
                )}
              />
            )}
            containerStyle={styles.inputToolbar}
          />
        )}
        renderBubble={(props) => (
          <Bubble
            {...props}
            textStyle={{
              right: { color: colors.textDark },
              left: { color: colors.textLight },
            }}
            wrapperStyle={{
              left: {
                backgroundColor: colors.bubbleDark,
              },
              right: {
                backgroundColor: colors.bubbleLight,
              },
            }}
          />
        )}
        renderChatFooter={(props) => (
          <View
            style={{
              height: Platform.OS === "ios" ? (keyboardOpen ? 13 : 30) : 20,
            }}
          ></View>
        )}
      />
      {/* </ImageBackground> */}
      {/* {Platform.OS === "ios" && <KeyboardAvoidingView behavior="padding" />} */}
      <StatusBar style="light" />
    </View>
  );
}
