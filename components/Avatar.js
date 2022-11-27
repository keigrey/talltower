import { View, Image, StyleSheet } from "react-native";
import React, { useContext } from "react";
import Context from "../context/Context";

export default function Avatar({ size, user }) {
  const {
    theme: { colors },
  } = useContext(Context);

  const styles = StyleSheet.create({
    imageOutline: {
      width: size + 12,
      height: size + 12,
      padding: 15,
      borderRadius: size + 12,
      borderWidth: 2,
      borderColor: colors.textGrey,
      alignItems: "center",
      justifyContent: "center",
      margin: 5,
    },
    image: {
      width: size,
      height: size,
      borderRadius: size,
    },
  });

  return (
    <View style={styles.imageOutline}>
      <Image
        source={
          user.photoURL
            ? { uri: user.photoURL }
            : require("../assets/user-icon-square-dark.png")
        }
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
}
