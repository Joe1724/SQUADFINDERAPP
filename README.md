# SquadFinder - (Mobile App)

A cross-platform mobile application designed to help **League of Legends** and **Valorant** players find compatible teammates. This app uses real-time matchmaking based on Riot API data to verify skill levels and ensure high-quality matches.

## 📱 Features
* **Riot Integration:** Link and verify Riot accounts (League of Legends & Valorant).
* **Global Server Scanning:** Auto-detects user region (e.g., SG2, PH2, LA1) using a custom multi-region scan logic.
* **Smart Matchmaking:** Find teammates based on verified Rank, Role, and Win Rate.
* **Dual-Game Support:** Seamlessly switch between League and Valorant profiles.
* **Real-time Status:** View live stats including K/D, Win Rate, and Rank Tiers.

## 🛠 Tech Stack
* **Framework:** React Native (Expo SDK 50+)
* **Language:** TypeScript / JavaScript
* **Navigation:** Expo Router
* **Networking:** Axios
* **UI Components:** React Native StyleSheet

## 🚀 Getting Started

### Prerequisites
* Node.js (LTS version)
* npm or yarn
* Expo Go app on your physical device (or Android Emulator/iOS Simulator)

### Installation
1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Joe1724/SQUADFINDERAPP.git](https://github.com/Joe1724/SQUADFINDERAPP.git)
    cd SQUADFINDERAPP
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npx expo start
    ```

4.  **Run on device**
    * Scan the QR code with the **Expo Go** app (Android/iOS).
    * Or press `a` for Android Emulator / `i` for iOS Simulator.
