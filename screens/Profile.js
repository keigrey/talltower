import { View, Text, TouchableOpacity } from "react-native";
import React, { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import Context from "../context/Context";

export default function Profile() {
  const {
    theme: { colors },
  } = useContext(Context);

  const [displayName, setDisplayName] = useState("");

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
        <TouchableOpacity>
          <Text>Hi</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
}
