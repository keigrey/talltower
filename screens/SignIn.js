import { View, Text } from "react-native";
import React from "react";
import Context from "../context/Context";
import { useContext } from "react";

export default function SignIn() {
  const {
    theme: { colors },
  } = useContext(Context);
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 24, marginBottom: 20 }}>
        Welcome to Talltower
      </Text>
    </View>
  );
}
