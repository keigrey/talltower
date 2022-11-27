import { View, Text } from "react-native";
import React, { useContext } from "react";
import Avatar from "./Avatar";
import { useRoute } from "@react-navigation/native";
import Context from "../context/Context";

export default function ChatHeader() {
  // TODO: maybe should use GlobalContext instead
  const {
    theme: { colors },
  } = useContext(Context);

  const route = useRoute();

  return (
    <View style={{ flexDirection: "row", marginLeft: -20 }}>
      <View>
        <Avatar size={35} user={route.params.user} />
      </View>
      <View
        style={{
          marginLeft: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.textLight, fontSize: 18 }}>
          {route.params.user.contactName || route.params.user.displayName}
        </Text>
      </View>
    </View>
  );
}
