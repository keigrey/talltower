import React, { useState, useEffect, useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, LogBox } from "react-native";
import { useAssets } from "expo-asset";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SignIn from "./screens/SignIn";
import ContextWrapper from "./context/ContextWrapper";
import Context from "./context/Context";
import Profile from "./screens/Profile";
import Chats from "./screens/Chats";
import Photo from "./screens/Photo";
import { Ionicons } from "@expo/vector-icons";
import Contacts from "./screens/Contacts";
import Chat from "./screens/Chat";
import ChatHeader from "./components/ChatHeader";

LogBox.ignoreLogs(["Sending"]);

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function App() {
  const [currUser, setCurrUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    theme: { colors },
  } = useContext(Context);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        setCurrUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Text>Loading..</Text>;
  }

  const styles = StyleSheet.create({});

  return (
    <NavigationContainer>
      {!currUser ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="signIn" component={SignIn} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: colors.textLight,
            },
            headerBackImage: () => (
              <Ionicons
                name="chevron-back-circle-outline"
                size={30}
                color={colors.textLight}
              />
            ),
          }}
        >
          {!currUser.displayName && (
            <Stack.Screen
              name="profile"
              component={Profile}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="home"
            component={Home}
            options={{ title: "Talltower" }}
          />
          {/* <Stack.Screen
            name="contacts"
            component={Contacts}
            options={{ title: "Select Contacts" }}
          /> */}
          <Stack.Screen
            name="chat"
            component={Chat}
            options={{
              headerTitle: (props) => <ChatHeader {...props} />,
              headerStyle: {
                backgroundColor: colors.background,
                elevation: 0,
                shadowOpacity: 0,
                // height: 120,
              },
            }}
          />
        </Stack.Navigator>
      )}
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

function Home() {
  const {
    theme: { colors },
  } = useContext(Context);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarLabel: () => {
            if (route.name === "photo") {
              return (
                <Ionicons name="camera" size={20} color={colors.textLight} />
              );
            } else {
              return (
                <Text style={{ color: colors.textLight }}>
                  {route.name[0].toLocaleUpperCase() + route.name.slice(1)}
                </Text>
              );
            }
          },
          tabBarShowIcon: true,
          tabBarLabelStyle: {
            color: colors.accent,
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.uiLight,
            height: "100%",
          },
          tabBarStyle: {
            backgroundColor: colors.background,
          },
        };
      }}
      initialRouteName="chats"
    >
      {/* <Tab.Screen name="photo" component={Photo} /> */}
      <Tab.Screen name="contacts" component={Contacts} />
      <Tab.Screen name="chats" component={Chats} />
    </Tab.Navigator>
  );
}

export default function Main() {
  const [assets] = useAssets(
    require("./assets/user-icon-dark.png"),
    require("./assets/user-icon-square-dark.png"),
    require("./assets/chat-background.png"),
    require("./assets/welcome-logo.png"),
    require("./assets/logo.png")
  );

  if (!assets) {
    return <Text>Loading...</Text>;
  }
  return (
    <ContextWrapper>
      <App />
    </ContextWrapper>
  );
}
