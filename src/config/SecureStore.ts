import * as SecureStore from "expo-secure-store";

export const setSecureStorage = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

export const getSecureStorage = async (key: string) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    return null;
  }
};
export const removeSecureStorage = async (key: string) => {
  return await SecureStore.deleteItemAsync(key);
};
