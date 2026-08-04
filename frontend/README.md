# Recurrly - React Native App

A modern React Native application built with Expo, featuring authentication, analytics, and subscription management.

## 🚀 Features

- **Authentication**: Powered by Clerk for secure user authentication
- **Analytics**: Integrated with PostHog for comprehensive analytics tracking
- **Styling**: NativeWind CSS for modern, utility-first styling
- **Navigation**: Expo Router for file-based routing
- **State Management**: Built-in React state management
- **Platform Support**: iOS, Android, and Web

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5
- **Platform**: Expo ~54.0.35
- **Router**: Expo Router ~6.0.24
- **Authentication**: Clerk Expo @clerk/expo ^3.1.5
- **Analytics**: PostHog React Native ^4.37.6
- **Styling**: NativeWind ^5.0.0-preview.3
- **CSS**: Tailwind CSS ^4.2.2
- **Language**: TypeScript ~5.9.2
- **Navigation**: React Navigation ^7.1.8

## 📱 Platforms

- **iOS**: Bundle ID `com.adhii.recurrly`
- **Android**: Package Name `com.adhii.recurrly`
- **Web**: Static output generation

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.4
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react_native-recurrly
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Environment Setup

Create a `.env` file based on `.env.example` and add your required environment variables:
- Clerk API keys
- PostHog API key
- Other required configuration

## 📱 Development

### Available Scripts

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Reset project (use with caution)
npm run reset-project

# Lint code
npm run lint
```

### Project Structure

```
├── app/                 # Expo Router configuration
├── assets/             # Images, fonts, and icons
├── components/         # Reusable React components
├── constants/          # Application constants
├── src/                # Source code
├── lib/                # Utility functions
└── global.css          # Global CSS styles
```

## 🔧 Configuration

### Fonts

The app uses Plus Jakarta Sans font family with multiple weights:
- Regular, Light, Medium, SemiBold, Bold, ExtraBold

### Icons

Custom icons are configured for:
- iOS app icon
- Android adaptive icon
- Splash screen

## 📊 Analytics

The app is integrated with PostHog for:
- User behavior tracking
- Performance monitoring
- Event analytics

## 🔐 Authentication

Clerk integration provides:
- User registration and login
- Session management
- Protected routes
- User profiles

## 🎨 Styling

- NativeWind CSS for utility-first styling
- Tailwind CSS v4 configuration
- Responsive design patterns
- Dark mode support

## 📄 License

This project is private and owned by Adhii.

## 👥 Team

Built with ❤️ using modern React Native development practices.

## 📞 Support

For support and questions, please contact the development team.