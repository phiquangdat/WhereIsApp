# WhereIsApp

## Overview

WhereIsApp is a React Native mobile application designed to help users record and manage location-based items with photo capture and list management features. Built for Android and iOS, it leverages modern libraries for navigation, camera functionality, and a user-friendly interface.

## Features

- **R1**: Navigate between Entry, Record Creation, and List screens.
- **R2**: Capture photos using the camera.
- **R3**: Display records in a scrollable list.
- **R4**: Persist data across app restarts.
- **R5.3**: Store photos locally with records.
- **R8.1**: Access camera with permission handling.
- **R9.1–R9.2**: Intuitive UI with error handling.
- **R6 (Optional)**: Search functionality for records.
- **R7 (Optional)**: Delete records.
- **R9.3 (Optional)**: Confirm deletions.

## Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- Android Studio with Android SDK (API 33+)
- Xcode (for iOS development)
- Emulator or physical device

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/WhereIsApp.git
cd WhereIsApp
```

### 2. Install Dependencies

```bash
npm install
cd ios && pod install && cd ..
```

### 3. Configure Environment

- **Android**:

  - Set up `android/local.properties` with:
    ```
    sdk.dir=/Users/yourusername/Library/Android/sdk
    ndk.dir=/Users/yourusername/Library/Android/sdk/ndk/27.1.12297006
    ```
  - Ensure Gradle 8.14 is used (check `gradle-wrapper.properties`).

- **iOS**:
  - Open `ios/WhereIsApp.xcodeproj` in Xcode.
  - Configure team and signing certificates.

### 4. Permissions

- **Android**: Update `AndroidManifest.xml` with camera permissions.
- **iOS**: Update `Info.plist` with camera usage descriptions.

### 5. Run the App

- **Start Metro**:
  ```bash
  npx react-native start --reset-cache
  ```
- **Run on Android**:
  ```bash
  npx react-native run-android --verbose [--port 8082] //Incase the start command took port 8081
  adb reverse tcp:8081 tcp:8081
  ```
- **Run on iOS**:
  ```bash
  npx react-native run-ios
  ```

## Usage

1. Launch the app to see the Entry screen with "Add New" and "List Items" buttons.
2. Tap "Add New" to access the Record Creation screen and capture a photo.
3. View and manage records on the List screen.
4. Test search and deletion (if implemented).

## Dependencies

- React Native: 0.79.2
- @react-navigation/stack: 7.3.0
- react-native-screens: 4.10.0
- react-native-vision-camera: 4.6.4
- Other standard React Native libraries

## Development

- **Code Structure**: Screens are in `screens/`, components in `components/`.
- **Testing**: Use Android Studio Logcat or Xcode console for debugging.
- **Contributing**: Fork the repo, create a branch, and submit a PR.

## Troubleshooting

- **Build Fails**: Run `./gradlew app:installDebug --stacktrace` and check logs.

Remove the gradle in your machine and start again:

`rm -rf /Users/yourusername/.gradle/`

`./gradlew clean build`
- **Camera Issues**: Ensure permissions are granted and a camera-supported device is used.
- **Dependency Conflicts**: Use `npm install --legacy-peer-deps` as a fallback.

## License

MIT License - See `LICENSE` file for details.

## Contact

For issues or questions, open an issue on the GitHub repository.
