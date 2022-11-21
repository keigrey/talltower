import { Image } from "react-native";
import React from "react";

export default function Avatar({ size, user }) {
  return (
    <Image
      source={
        user.photoURL
          ? { uri: user.photoURL }
          : require("../assets/user-icon-square-dark.png")
      }
      resizeMode="cover"
      style={{ width: size, height: size, borderRadius: size }}
    />
  );
}
