import { persistor, store } from '@/src/_store/index';
import * as Font from 'expo-font';
import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function RootLayout() {

    const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
  // Ionicons (Ionicons.ttf)
  Ionicons: require('@/assets/fonts/Ionicons.ttf'),

  // FontAwesome (FontAwesome.ttf)
  FontAwesome: require('@/assets/fonts/FontAwesome.ttf'),
  // MaterialIcons (MaterialIcons.ttf)
  MaterialIcons: require('@/assets/fonts/MaterialIcons.ttf'),

  // MaterialCommunityIcons
  MaterialCommunityIcons: require('@/assets/fonts/MaterialCommunityIcons.ttf'),



}).then(() => setFontsLoaded(true))
      .catch(console.error);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="StepPage" options={{ headerShown: false, title: "Step Page" }} />
          <Stack.Screen name="Login" options={{ headerShown: false, title: "Login" }} />
          <Stack.Screen name="Signup" options={{ headerShown: false, title: "Sign Up" }} />
          <Stack.Screen name="AddCenter" options={{ headerShown: false }} />
          <Stack.Screen name="PrivacyPolicy" options={{headerShown: false, title: "Privacy Policy" }} />
          <Stack.Screen name="TermsAndConditions" options={{headerShown: false, title: "Terms & Conditions" }} />
          <Stack.Screen name="DonationCenter" options={{ headerShown: false }} />
          <Stack.Screen name="ManageCenters" options={{ headerShown: false }} />
          <Stack.Screen name="DonationRecord" options={{ headerShown: false }} />
          <Stack.Screen name="DonationHistory" options={{ headerShown: false }} />
          <Stack.Screen name="BookAppointment" options={{ headerShown: false }} />
          <Stack.Screen name="ManageRequests" options={{ headerShown: false }} />
          <Stack.Screen name="RequestBlood" options={{ headerShown: false }} />
          <Stack.Screen name="ManageDonations" options={{ headerShown: false }} />
          <Stack.Screen name="ManageAppointments" options={{ headerShown: false }} />
          <Stack.Screen name="CenterStock" options={{ headerShown: false }} />
          <Stack.Screen name="ManageUsers" options={{ headerShown: false }} />
          <Stack.Screen name="BloodGroup" options={{ headerShown: false }} />
          <Stack.Screen name="Donor" options={{ headerShown: false }} />
          <Stack.Screen name="Admin" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </PersistGate>
    </Provider>
  );
}
