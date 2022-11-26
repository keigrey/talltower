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
    textInput: {
      borderBottomColor: colors.primary,
      borderBottomWidth: 2,
      width: 200,
      color: colors.text,
      backgroundColor: colors.secondary,
      borderRadius: 20,
    },
    button: {
      alignItems: "center",
      backgroundColor: !password || !email ? colors.tertiary : colors.iconGray,
      padding: 5,
      marginTop: 20,
      borderRadius: 20,
    },
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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 24, marginBottom: 20 }}>
        Welcome to Talltower
      </Text>
      <Image
        source={require("../assets/welcome-logo.png")}
        style={{ width: 180, height: 180 }}
        resizeMode="cover"
      />
      <View style={{ marginTop: 20 }}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.tertiary}
          style={styles.textInput}
        />
        {/* TODO: password min length 6 chars */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.tertiary}
          style={{ ...styles.textInput, marginTop: 20 }}
          secureTextEntry={true}
        />
      </View>
      <View>
        <TouchableOpacity
          onPress={handlePress}
          disabled={!password || !email}
          style={styles.button}
        >
          <Text>{mode === "signUp" ? "Sign Up" : "Sign In"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            mode === "signUp" ? setMode("signIn") : setMode("signUp")
          }
          style={{ marginTop: 15 }}
        >
          <Text style={{ color: colors.text }}>
            {mode === "signUp"
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </View>
  );
}
