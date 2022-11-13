import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import Context from "../context/Context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { pickImage, askForPermission, uploadImage } from "../utils";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const {
    theme: { colors },
  } = useContext(Context);

  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  // TODO: choose better name
  const [pressed, setPressed] = useState(false);

  async function handlePress() {
    setPressed(true);
    ///////////////////////////////////////////////
    const user = auth.currentUser;
    let photoURL;

    if (selectedImage) {
      const { url } = await uploadImage(
        selectedImage,
        `images/${user.uid}`,
        "profilePicture"
      );
      photoURL = url;
    }

    // TODO: add user language
    const userData = {
      displayName,
      email: user.email,
    };

    if (photoURL) {
      userData.photoURL = photoURL;
    }

    await Promise.all([
      updateProfile(user, userData),
      setDoc(doc(db, "users", user.uid), { ...userData, uid: user.uid }),
    ]);

    navigation.navigate("home");
  }

  async function handleProfilePicture() {
    const permissionStatus = await askForPermission();
    if (permissionStatus === "granted") {
      const result = await pickImage();
      if (!result.cancelled) {
        setSelectedImage(result.uri);
      }
    }
  }

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: Constants.statusBarHeight + 20,
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 22, color: colors.backgound }}>
          Profile Info
        </Text>
        <Text style={{ fontSize: 14, color: colors.backgound, marginTop: 20 }}>
          Please provide your name and an optional profile photo
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            width: 120,
            height: 120,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 120,
            backgroundColor: "red",
          }}
        >
          {!selectedImage ? (
            <MaterialCommunityIcons
              name="camera-plus"
              color={colors.iconGray}
              size={45}
            />
          ) : (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "100%", height: "100%", borderRadius: 120 }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Your name"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            borderBottomColor: colors.primary,
            borderBottomWidth: 2,
            width: "100%",
            marginTop: 40,
          }}
        />
        {pressed && (
          <ActivityIndicator
            size="large"
            color="#2b2b2b"
            style={{
              marginTop: 40,
            }}
          />
        )}
        <TouchableOpacity
          onPress={handlePress}
          disabled={!displayName}
          style={{
            alignItems: "center",
            backgroundColor: !displayName ? colors.tertiary : colors.text,
            padding: 5,
            marginTop: "auto",
            width: 80,
          }}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
}
