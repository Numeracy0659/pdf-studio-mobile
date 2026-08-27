# Android APK builds

The **Build Android APK** GitHub Actions workflow runs when code is pushed to the `main` branch and can also be started manually from the repository’s **Actions** tab. It installs the project’s locked JavaScript dependencies, generates the Android project from the Expo configuration, runs Gradle’s `assembleRelease` task, and uploads the resulting `PDF-Studio-release-APK` artifact.

The artifact is a **standalone release APK** that bundles the JavaScript needed to start without a development server. The workflow uses the standard local Android debug signing key only so it can be installed directly for testing; it is not suitable for Play Store submission. The workflow verifies that the APK contains both `armeabi-v7a` (32-bit ARM) and `arm64-v8a` (64-bit ARM) native libraries before it uploads the artifact. After a successful workflow run, open the run summary, download `PDF-Studio-release-APK`, unzip the downloaded artifact, and install `app-release.apk` on an Android device. Android may ask for permission to install apps from the file manager or browser used for the download.

This workflow intentionally does not use or commit any Expo, Android, or GitHub secret. A production Play Store release requires a separate signing-key workflow and protected repository secrets.
