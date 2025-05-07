import { persistor, store } from '@/src/_store/index';
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="StepPage" options={{ headerShown: false, title: "Step Page" }} />
          <Stack.Screen name="Login" options={{ headerShown: false, title: "Login" }} />
          <Stack.Screen name="Signup" options={{ headerShown: false, title: "Sign Up" }} />
          <Stack.Screen name="privacy-policy" options={{ title: "Privacy Policy" }} />
          <Stack.Screen name="terms-and-conditions" options={{ title: "Terms & Conditions" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </PersistGate>
    </Provider>
  );
}
