# Android APK builds

The **Build Android APK** GitHub Actions workflow runs when code is pushed to the `main` branch and can also be started manually from the repository’s **Actions** tab. It installs the project’s locked JavaScript dependencies, generates the Android project from the Expo configuration, runs Gradle’s `assembleDebug` task, and uploads the resulting `PDF-Studio-debug-APK` artifact.

The artifact is an **installable debug APK** signed with Android’s debug key. After a successful workflow run, open the run summary, download `PDF-Studio-debug-APK`, unzip the downloaded artifact, and install `app-debug.apk` on an Android device. Android may ask for permission to install apps from the file manager or browser used for the download.

This workflow intentionally does not use or commit any Expo, Android, or GitHub secret. A production Play Store release requires a separate signing-key workflow and protected repository secrets.
