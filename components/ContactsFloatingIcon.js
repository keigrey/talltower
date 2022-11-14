import { TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlobalContext from "../context/Context";

export default function ContactsFloatingIcon() {
  const {
    theme: { colors },
  } = useContext(GlobalContext);

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        borderRadius: 60,
        width: 60,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
      }}
    >
      <MaterialCommunityIcons
        name="android-messages"
        size={30}
        color="red"
        style={{ transform: [{ scaleX: -1 }] }}
      />
    </TouchableOpacity>
  );
}
