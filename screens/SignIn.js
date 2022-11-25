import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useContext, useState } from "react";
import Context from "../context/Context";
import { signIn, signUp } from "../firebase";

export default function SignIn() {
  const {
    theme: { colors },
  } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signUp");

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
        // backgroundColor: colors.background,
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
          style={{
            borderBottomColor: colors.primary,
            borderBottomWidth: 2,
            width: 200,
          }}
        />
        {/* TODO: password min length 6 chars */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={{
            borderBottomColor: colors.primary,
            borderBottomWidth: 2,
            width: 200,
            marginTop: 20,
          }}
          secureTextEntry={true}
        />
      </View>
      <View>
        <TouchableOpacity
          onPress={handlePress}
          disabled={!password || !email}
          style={{
            alignItems: "center",
            backgroundColor:
              !password || !email ? colors.tertiary : colors.text,
            padding: 5,
            marginTop: 20,
          }}
        >
          <Text>{mode === "signUp" ? "Sign Up" : "Sign In"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            mode === "signUp" ? setMode("signIn") : setMode("signUp")
          }
          style={{ marginTop: 15 }}
        >
          <Text>
            {mode === "signUp"
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
