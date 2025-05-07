import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from "./_reducers";

const persistConfig = {
  key: 'Blood-Donation',
  storage: AsyncStorage,
  transforms: [
    encryptTransform({
      secretKey: "c9d5f215-6005-4a5e-8476-abb6d2e35521", // Use a strong, unique key here
      onError: function (error) {
        console.error("Encryption error:", error);
      },
    }),
  ],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
