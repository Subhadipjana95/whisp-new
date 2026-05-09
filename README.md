# Whisp (NoteVoice) 🎙️

Whisp is a premium, local-first voice note and reminder application built with React Native and Expo. It leverages AI to transcribe voice recordings and intelligently categorize them into notes or reminders based on context.

## ✨ Features

- **AI-Powered Transcription**: Converts voice recordings to text using OpenAI's Whisper API.
- **Smart Parsing**: Uses Anthropic's Claude API to detect intent—automatically creating a **Note** or a **Reminder** with due dates.
- **Local-First Architecture**: High-performance storage using SQLite and Drizzle ORM.
- **Smart Reminders**: Integrated with `expo-notifications` for timely alerts with action buttons (Done, Snooze).
- **Attachments**: Support for photos, documents, and audio clips attached to any record.
- **Premium UI/UX**: Modern dark-mode interface inspired by Linear, featuring smooth Reanimated transitions and glassmorphism.
- **Theming**: Reactive Light, Dark, and System theme switching.
- **Privacy-First**: All data stays on your device. API keys are stored locally via MMKV.

## 🚀 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54+) with Expo Router v3
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) + [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Animations**: [React Native Reanimated](https://www.react-native-reanimated.org/)
- **AI Services**: OpenAI (Whisper), Anthropic (Claude)
- **Persistence**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)

## 📦 Project Structure

```text
whisp/
├── app/                  # Expo Router file-based navigation
│   ├── _layout.tsx       # Root layout, providers & listeners
│   ├── index.tsx         # Dashboard (unified notes + reminders)
│   ├── settings.tsx      # App settings & API configuration
│   ├── note/[id].tsx     # Note detail & editing
│   └── reminder/[id].tsx # Reminder detail & scheduling
├── src/
│   ├── components/       # Reusable UI (Cards, Modals, Loaders)
│   ├── db/               # Database schema & migrations
│   ├── hooks/            # Custom hooks (Recorder, Search, Theme)
│   ├── services/         # Business logic (AI, Notifications, Files)
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript interfaces
│   ├── constants/        # App-wide constants
│   └── theme/            # Design tokens
└── assets/               # Static assets & sounds
```

## 🛠️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (recommended) or npm
- [Expo Go](https://expo.dev/client) app on your mobile device (or an emulator)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/whisp.git
cd whisp

# Install dependencies
bun install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_here
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key_here
```
*Note: You can also configure these keys directly in the app's Settings screen.*

### 4. Running the App
```bash
# Start the development server
bun start
```
Scan the QR code with your camera (iOS) or Expo Go app (Android) to launch.

## 💾 Database Migrations
If you modify the database schema in `src/db/schema.ts`, generate a new migration:
```bash
npx drizzle-kit generate
```

### Contributions

Built and Developer by [@Subhadip95](https://a063.xyz) 💚 2026