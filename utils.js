import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const palette = {
  jet: "#0b0c0b", //background
  onyx: "#181818",
  shadow: "#1f201f", // text box dark, search box
  mist: "#333433", // text on dark
  ice: "#cdd8dd", //text box light
  snow: "#e7ebeb", // header text white
  charcoal: "#080a09", // header text black
  mint: "#58ad89", // select green
  heather: "#8654ad", // select purple
  black: "#000000",
  stone: "#525452",
  wine: "#8c0034",
};

export const theme = {
  colors: {
    background: palette.jet,
    uiLight: palette.snow,
    textInput: palette.shadow,
    textLight: palette.snow,
    textDark: palette.charcoal,
    textGrey: palette.mist,
    textTime: palette.stone,
    accent: palette.heather,
    bubbleLight: palette.ice,
    bubbleDark: palette.shadow,
    inactive: palette.onyx,
    error: palette.wine,
    unread: palette.mint,

    ////////////////////////
    primary: palette.jet,
    tertiary: palette.mist,
    secondary: palette.shadow,
    white: palette.ice,
    text: palette.snow,
    secondaryText: palette.charcoal,
    iconGray: palette.mint,
  },
};
// export const theme = {
//   colors: {
//     background: palette.jet,
//     // foreground: palette.tealGreenDark,
//     primary: palette.jet,
//     tertiary: palette.mist,
//     secondary: palette.shadow,
//     white: palette.ice,
//     text: palette.snow,
//     secondaryText: palette.charcoal,
//     iconGray: palette.mint,
//   },
// };

export async function pickImage() {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    // aspect: [4, 3],
    quality: 0.2,
  });
  return result;
}

export async function takePhoto() {
  let result = await ImagePicker.launchCameraAsync();
  return result;
}

export async function askForPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status;
}

export async function askForPermissionCamera() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status;
}

export async function uploadImage(uri, path, fName) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const fileName = fName || nanoid();
  const imageRef = ref(storage, `${path}/${fileName}.jpeg`);

  const snapshot = await uploadBytes(imageRef, blob, {
    contentType: "image/jpeg",
  });

  // We're done with the blob, close and release it
  blob.close();

  const url = await getDownloadURL(snapshot.ref);

  return { url, fileName };
}
