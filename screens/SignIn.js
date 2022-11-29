import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import Context from "../context/Context";
import { signIn, signUp } from "../firebase";
import { StatusBar } from "expo-status-bar";

export default function SignIn() {
  const {
    theme: { colors },
  } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signIn");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [badEmail, setBadEmail] = useState(false);
  const [badPassword, setBadPassword] = useState(false);
  const [firebaseErrorCode, setFirebaseErrorCode] = useState(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    mainView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    title: { color: colors.textLight, fontSize: 24, marginBottom: 20 },
    logo: { width: 180, height: 180 },
    textInput: {
      height: 35,
      width: 200,
      borderRadius: 35,
      paddingLeft: 15,
      paddingRight: 15,
      color: colors.textLight,
      backgroundColor: colors.textInput,
      borderColor: colors.error,
    },
    button: {
      height: 35,
      width: 200,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: !password || !email ? colors.inactive : colors.accent,
      marginTop: 20,
    },
    clickableText: { color: colors.textLight, textAlign: "center" },
    textError: {
      color: colors.error,
      fontSize: 12,
      width: 200,
      paddingLeft: 15,
    },
  });

  async function handlePress() {
    Keyboard.dismiss();
    setBadPassword(false);
    setBadEmail(false);
    setFirebaseErrorCode(null);

    if (mode === "signUp") {
      try {
        await signUp(email.trim(), password);
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === "auth/weak-password") {
          setBadPassword(true);
        } else if (errorCode === "auth/invalid-email") {
          setBadEmail(true);
        } else if (errorCode === "auth/email-already-in-use") {
          setBadEmail(true);
        }

        setFirebaseErrorCode(errorCode);
      }
    }
    if (mode === "signIn") {
      try {
        await signIn(email.trim(), password);
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === "auth/wrong-password") {
          setBadPassword(true);
        } else if (errorCode === "auth/invalid-email") {
          setBadEmail(true);
        } else if (errorCode === "auth/user-not-found") {
          setBadEmail(true);
        }

        setFirebaseErrorCode(errorCode);
      }
    }
  }

  function getErrorMessage() {
    if (firebaseErrorCode === "auth/invalid-email") {
      return "Invalid email";
    } else if (firebaseErrorCode === "auth/email-already-in-use") {
      return "Email is already in use";
    } else if (firebaseErrorCode === "auth/user-not-found") {
      return "User not found";
    }
  }

  return (
    <View style={styles.mainView}>
      {!keyboardOpen && (
        <>
          {/* <Text style={styles.title}>Welcome to Talltower</Text> */}
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 180, height: 100, marginBottom: 15 }}
            resizeMode="contain"
          />
          <Image
            source={require("../assets/welcome-logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </>
      )}
      <View style={{ marginTop: 20 }}>
        {badEmail && <Text style={styles.textError}>{getErrorMessage()}</Text>}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor={colors.textGrey}
          selectionColor={colors.accent}
          style={{
            ...styles.textInput,
            marginBottom: 15,
            borderWidth: badEmail ? 1 : 0,
          }}
        />
        {badPassword && (
          <Text style={styles.textError}>
            {firebaseErrorCode === "auth/weak-password"
              ? "Password should be at least 6 characters long"
              : "Wrong password"}
          </Text>
        )}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.textGrey}
          selectionColor={colors.accent}
          style={{ ...styles.textInput, borderWidth: badPassword ? 1 : 0 }}
          secureTextEntry={true}
        />
      </View>
      <View>
        <TouchableOpacity
          onPress={handlePress}
          disabled={!password || !email}
          style={styles.button}
        >
          <Text style={{ color: colors.textLight }}>
            {mode === "signUp" ? "Sign Up" : "Sign In"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            mode === "signUp" ? setMode("signIn") : setMode("signUp")
          }
          style={{ marginTop: 15 }}
        >
          <Text style={styles.clickableText}>
            {mode === "signUp"
              ? "Already have an account?\nSign In"
              : "Don't have an account?\nSign Up"}
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </View>
  );
}
