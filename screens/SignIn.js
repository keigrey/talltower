import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useState } from "react";
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
      color: colors.text,
      backgroundColor: colors.textInput,
    },
    button: {
      height: 35,
      width: 200,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        !password || !email ? colors.inactive : colors.textAccent,
      marginTop: 20,
    },
    clickableText: { color: colors.text, textAlign: "center" },
  });

  async function handlePress() {
    if (mode === "signUp") {
      await signUp(email, password);
    }
    if (mode === "signIn") {
      await signIn(email, password);
    }
  }

  return (
    <View style={styles.mainView}>
      <Text style={styles.title}>Welcome to Talltower</Text>
      <Image
        source={require("../assets/welcome-logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />
      <View style={{ marginTop: 20 }}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.tertiary}
          selectionColor={colors.textAccent}
          style={styles.textInput}
        />
        {/* TODO: password min length 6 chars */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.tertiary}
          selectionColor={colors.textAccent}
          style={{ ...styles.textInput, marginTop: 15 }}
          secureTextEntry={true}
        />
      </View>
      <View>
        <TouchableOpacity
          onPress={handlePress}
          disabled={!password || !email}
          style={styles.button}
        >
          <Text style={{ color: "white" }}>
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
