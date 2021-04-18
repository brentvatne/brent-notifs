import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Text, View, Button, Platform, StyleSheet } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      // @ts-ignore
      setExpoPushToken(token);
      console.log(token);
    });

    // @ts-ignore
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // @ts-ignore
        setNotification(notification);
      }
    );

    // @ts-ignore
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        alert(JSON.stringify(response));
        console.log(response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(
        // @ts-ignore
        notificationListener.current
      );
      // @ts-ignore
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  return (
    <View style={styles.container}>
      <Text>{expoPushToken}</Text>
      <StatusBar style="auto" />
    </View>
  );
}
async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const {
      status: existingStatus,
    } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } catch (e) {
      alert(e.message);
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
