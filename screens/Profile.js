import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import Context from "../context/Context";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  pickImage,
  askForPermission,
  uploadImage,
  askForPermissionCamera,
  takePhoto,
} from "../utils";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

export default function Profile() {
  const {
    theme: { colors },
  } = useContext(Context);

  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  // TODO: choose better name
  const [pressed, setPressed] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  async function handlePress() {
    Keyboard.dismiss();
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

    const userData = {
      displayName,
      email: user.email,
      language: selectedLanguage,
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

  async function handleProfilePictureCamera() {
    const permissionStatus = await askForPermissionCamera();
    if (permissionStatus === "granted") {
      const result = await takePhoto();
      if (!result.cancelled) {
        setSelectedImage(result.uri);
      }
    }
  }

  const styles = StyleSheet.create({
    fillView: {
      flex: 1,
    },
    mainView: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: Constants.statusBarHeight + 20,
      padding: 20,
      backgroundColor: colors.background,
    },
    loadingView: {
      backgroundColor: colors.bubbleLight,
      opacity: 0.7,
      position: "absolute",
      height: "100%",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    throbber: {
      backgroundColor: colors.bubbleDark,
      padding: 12,
      borderRadius: 35,
    },
    title: {
      fontSize: 22,
      color: colors.text,
    },
    subText: { fontSize: 14, color: colors.text, marginTop: 20 },
    imagePickerOutline: {
      width: 120,
      height: 120,
      padding: 15,
      borderRadius: 120,
      borderWidth: 2,
      borderColor: colors.textGrey,
      alignItems: "center",
      justifyContent: "center",
    },
    imagePicker: {
      width: 100,
      height: 100,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    selectedImage: { width: "100%", height: "100%", borderRadius: 120 },
    textInput: {
      height: 35,
      width: 200,
      borderRadius: 35,
      paddingLeft: 15,
      paddingRight: 15,
      color: colors.text,
      backgroundColor: colors.textInput,
      marginTop: keyboardOpen ? 20 : 40,
    },
    languagePickerView: {
      backgroundColor: colors.textInput,
      width: 200,
      height: Platform.OS === "ios" ? 150 : 35,
      borderRadius: 35,
      overflow: "hidden",
      justifyContent: "center",
      paddingLeft: Platform.OS === "ios" ? 0 : 8,
      marginTop: 20,
    },
    languagePicker: {
      width: "100%",
      backgroundColor:
        Platform.OS === "ios" ? colors.textInput : colors.textInput,
      color: selectedLanguage ? colors.textLight : colors.textGrey,
    },
    languagePickerFont: {
      size: 13.5,
    },

    button: {
      height: 35,
      width: 80,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: !(displayName && selectedLanguage)
        ? colors.inactive
        : colors.accent,
      padding: 5,
      marginTop: "auto",
      marginBottom:
        Platform.OS === "ios" ? (keyboardOpen ? keyboardHeight + 10 : 0) : 0,
    },
    clickableText: { color: colors.textLight, textAlign: "center" },
  });

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <View blur style={styles.fillView}>
        <View style={styles.mainView}>
          {!keyboardOpen && (
            <>
              <Text style={styles.title}>Profile Info</Text>
              <Text style={styles.subText}>
                Please provide your name and an optional profile photo
              </Text>
            </>
          )}
          <View style={{ marginTop: keyboardOpen ? 5 : 30 }}>
            <TouchableOpacity
              onPress={handleProfilePictureCamera}
              style={{ alignSelf: "flex-end" }}
            >
              <MaterialCommunityIcons
                name="camera-plus"
                color={colors.accent}
                size={20}
              />
            </TouchableOpacity>

            <View style={styles.imagePickerOutline}>
              <TouchableOpacity
                onPress={handleProfilePicture}
                style={styles.imagePicker}
              >
                {!selectedImage ? (
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={40}
                    color={colors.textLight}
                  />
                ) : (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.selectedImage}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            placeholder="Your name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholderTextColor={colors.textGrey}
            selectionColor={colors.accent}
            style={styles.textInput}
          />
          <View style={styles.languagePickerView}>
            <Picker
              selectedValue={selectedLanguage}
              onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
              style={styles.languagePicker}
            >
              <Picker.Item
                color={
                  Platform.OS === "ios" ? colors.textLight : colors.textTime
                }
                label="Choose you language"
                value={null}
                style={{ fontSize: styles.languagePickerFont.size }}
              />
              <Picker.Item
                color={
                  Platform.OS === "ios" ? colors.textLight : colors.textDark
                }
                label="English"
                value="EN"
                style={{ fontSize: styles.languagePickerFont.size }}
              />
              <Picker.Item
                color={
                  Platform.OS === "ios" ? colors.textLight : colors.textDark
                }
                label="Russian"
                value="RU"
                style={{ fontSize: styles.languagePickerFont.size }}
              />
              <Picker.Item
                color={
                  Platform.OS === "ios" ? colors.textLight : colors.textDark
                }
                label="Japanese"
                value="JA"
                style={{ fontSize: styles.languagePickerFont.size }}
              />
            </Picker>
          </View>
          <TouchableOpacity
            onPress={handlePress}
            disabled={!(displayName && selectedLanguage)}
            style={styles.button}
          >
            <Text style={styles.clickableText}>Next</Text>
          </TouchableOpacity>
        </View>
        {pressed && (
          <View style={styles.loadingView}>
            <ActivityIndicator
              size="large"
              color={colors.textLight}
              style={styles.throbber}
            />
          </View>
        )}
      </View>
    </React.Fragment>
  );
}
