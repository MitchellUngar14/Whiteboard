# 📝 Digital Whiteboard

A modern, highly interactive digital whiteboard for managing tasks and notes. Designed for productivity with a sleek, glassmorphic aesthetic.

---

## ✨ Features

- **✅ Tasks & Notes**: Effortlessly create task cards or yellow sticky notes to organize your thoughts.
- **🖊️ Rich Text Support**: Full WYSIWYG editing.
  - **Bold**, <u>Underline</u>, Bullet Lists, and `Code Blocks` supported.
- **🚀 Advanced Interactions**:
  - **Drag & Drop**: Smooth, hardware-accelerated movement on both desktop and mobile devices.
  - **Smart Resizing**: Resize any card by dragging its corner. The card's height automatically respects its content, preventing text from ever being cut off.
  - **Radial Context Menu**: A premium radial menu that fans out on right-click or long-press, letting you pick colors, manage layers (Bring to Front/Back), or delete cards.
- **🌓 Theme System**: Seamlessly switch between a high-contrast Neon Dark mode and a refined, deep-toned Light mode.
- **📱 PWA Ready**: Install the app directly to your home screen. Fully offline capable with high-performance caching.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Global variables, CSS Modules architecture)
- **Persistence**: IndexedDB (via lightweight custom store)
- **Offline**: [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/whiteboard.git
   ```
2. Navigate to the project directory
   ```bash
   cd whiteboard
   ```
3. Install dependencies
   ```bash
   npm install
   ```

### Development

Run the development server locally:
```bash
npm run dev
```

### Build

Create a production-ready build:
```bash
npm run build
```

---

## 📱 Mobile Installation

This app is optimized as a PWA. To install it on your device:

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android / Desktop
1. Open the app in Chrome
2. Tap the three dots menu
3. Select "Install App"

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and ☕
</p>

---
