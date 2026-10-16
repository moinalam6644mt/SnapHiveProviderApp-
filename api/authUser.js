import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const baseURL = "https://snaphive.online/app";

const getMemberData = async () => {
  try {
    const memberDataRaw = await AsyncStorage.getItem("member_data");
    if (memberDataRaw) {
      return JSON.parse(memberDataRaw);
    }
    const authDataRaw = await AsyncStorage.getItem("authData");
    if (authDataRaw) {
      return JSON.parse(authDataRaw);
    }
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

const buildUrlEncodedBody = (obj) => {
  const parts = [];
  for (const key in obj) {
    const val = obj[key];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      val.forEach((item) => {
        const arrayKey = key.endsWith("[]") ? key : `${key}[]`;
        parts.push(`${encodeURIComponent(arrayKey)}=${encodeURIComponent(String(item))}`);
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
    }
  }
  return parts.join("&");
};

export const AuthUser = () => {
  const callApi = async ({ method, api, data = {}, onUploadProgress }) => {
    const memberData = await getMemberData();
    const defaultHeaders = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
      "Accept": "application/json, text/plain, */*"
    };
    let finalData = { ...data };
    let queryParams = {};
    if (memberData) {
      const dataObj = memberData?.data || memberData;
      const actualId = dataObj?.worker_id || dataObj?.member_id;
      const actualToken = dataObj?.token || dataObj?.member_token;

      if (actualId) {
        await AsyncStorage.setItem("member_id", String(actualId));
        queryParams = {
          member_id: actualId,
          orginatesoft_lang: "en",
        };
      }
      if (actualToken) {
        defaultHeaders["flance"] = `Bearer ${actualToken}`;
      }
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

        case "POST": {
          const encodedBody =
            typeof finalData === "object" && !(finalData instanceof FormData)
              ? buildUrlEncodedBody(finalData)
              : finalData;
          response = await axios.post(finalURL, encodedBody, {
            headers: {
              ...defaultHeaders,
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            params: queryParams,
          });
          break;
        }

        case "CUSTOM_POST": {
          const hasNativeFile = Object.values(finalData).some(
            (v) => v && typeof v === "object" && typeof v.uri === "string"
          );

          if (hasNativeFile) {
            const formData = new FormData();
            for (const key in finalData) {
              const val = finalData[key];
              if (val === undefined || val === null) continue;

              if (Array.isArray(val)) {
                val.forEach((item) => {
                  const arrayKey = key.endsWith("[]") ? key : `${key}[]`;
                  formData.append(
                    arrayKey,
                    typeof item === "object" && item?.uri ? item : String(item)
                  );
                });
              } else if (typeof val === "object" && val?.uri) {
                formData.append(key, val);
              } else {
                formData.append(key, String(val));
              }
            }

            // Do NOT manually set Content-Type so React Native generates boundary automatically
            const multipartHeaders = { ...defaultHeaders };
            delete multipartHeaders["Content-Type"];

            response = await axios.post(finalURL, formData, {
              headers: multipartHeaders,
              params: queryParams,
              ...(onUploadProgress && { onUploadProgress }),
            });
          } else {
            // Text and Base64 data: send as application/x-www-form-urlencoded
            const encodedBody = buildUrlEncodedBody(finalData);
            response = await axios.post(finalURL, encodedBody, {
              headers: {
                ...defaultHeaders,
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
              },
              params: queryParams,
              ...(onUploadProgress && { onUploadProgress }),
            });
          }
          break;
        }

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
      console.error(
        "API call failed:",
        error.message,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  };

  return { callApi, getMemberData };
};
