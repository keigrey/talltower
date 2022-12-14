import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { Grid, Row, Col } from "react-native-easy-grid";
import Context from "../context/Context";
import Avatar from "./Avatar";

export default function ListItem({
  type,
  description,
  user,
  time,
  room,
  image,
  style,
}) {
  const {
    theme: { colors },
  } = useContext(Context);

  const navigation = useNavigation();

  const styles = StyleSheet.create({
    grid: { maxHeight: 80 },
    touchable: { height: 80, ...style },
    columnText: {
      fontWeight: "bold",
      fontSize: 16,
      color: colors.textLight,
    },
  });

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("chat", { user, room, image })}
      style={styles.touchable}
    >
      <Grid style={styles.grid}>
        <Col
          style={{ width: 80, alignItems: "center", justifyContent: "center" }}
        >
          <Avatar user={user} size={type === "contacts" ? 40 : 50} />
        </Col>
        <Col style={{ marginLeft: 10 }}>
          <Row style={{ alignItems: "center" }}>
            <Col>
              <Text style={styles.columnText}>
                {user.contactName || user.displayName}
              </Text>
            </Col>
            {time && (
              <Col style={{ alignItems: "flex-end" }}>
                <Text style={{ color: colors.textLight, fontSize: 11 }}>
                  {new Date(time.seconds * 1000).toLocaleDateString()}
                </Text>
              </Col>
            )}
          </Row>
          {description && (
            <Row style={{ marginTop: -5 }}>
              <Text style={{ color: colors.textLight, fontSize: 13 }}>
                {description}
              </Text>
            </Row>
          )}
        </Col>
      </Grid>
    </TouchableOpacity>
  );
}
