import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const baseURL = "https://snaphive.online/app";

const getMemberData = async () => {
  try {
    const token = await AsyncStorage.getItem("member_data");
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const AuthUser = () => {
  const callApi = async ({ method, api, data = {}, onUploadProgress }) => {
    const memberData = await getMemberData();
    const defaultHeaders = {};
    let finalData = { ...data };
    let queryParams = {};
    if (memberData) {
      const { member_id, member_token } = memberData?.data || {};
      await AsyncStorage.setItem("member_id", member_id);
      defaultHeaders["flance"] = `Bearer ${member_token}`;

      queryParams = {
        member_id: member_id,
        orginatesoft_lang: "en",
      };
    }

    const finalURL = `${baseURL}${api}`;

    try {
      let response;
      switch (method) {
        case "GET":
          response = await axios.get(finalURL, {
            headers: defaultHeaders,
            params: { ...queryParams, ...finalData },
          });
          break;

        case "POST":
          response = await axios.post(finalURL, finalData, {
            headers: defaultHeaders,
            params: queryParams,
          });
          break;

        case "CUSTOM_POST":
          const imageDataToSend = new FormData();
          for (const key in finalData) {
            imageDataToSend.append(key, finalData[key]);
          }

          response = await axios.post(finalURL, imageDataToSend, {
            headers: {
              ...defaultHeaders,
              "Content-Type": "multipart/form-data",
            },
            params: queryParams,
            ...(onUploadProgress && { onUploadProgress }),
          });
          break;

        case "DELETE":
          response = await axios.delete(finalURL, {
            headers: defaultHeaders,
            params: queryParams,
          });
          break;

        default:
          throw new Error("Unsupported HTTP method");
      }

      return response.data;
    } catch (error) {
      console.error("API call failed:", error.message);
      throw error;
    }
  };

  return { callApi, getMemberData };
};
