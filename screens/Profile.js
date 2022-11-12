import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import Context from "../context/Context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Profile() {
  const {
    theme: { colors },
  } = useContext(Context);

  const [displayName, setDisplayName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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
      </View>
    </React.Fragment>
  );
}
