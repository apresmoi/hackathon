# 🌿 CalmBoard AI

**A calming wellness app for the workplace – powered by AI, built with React + Tailwind CSS.**  
[🌐 Live Demo](https://v0-basic-react-app-three.vercel.app/)

---

## 🧘‍♀️ What is CalmBoard AI?

CalmBoard AI is a lightweight and elegant web app designed to help professionals pause, reflect, and recharge throughout the day.  
By analyzing user emotions via natural language input, it provides personalized wellness experiences like:

- Visual moodboards based on uplifting imagery
- Guided breathing animations
- Music or video suggestions
- A mini retro-style interactive game

---

## ✨ Features

- ✅ Emotion check-in with AI-powered reflection
- ✅ Moodboard generator (based on calming keywords)
- ✅ Breathing animations and focus tips
- ✅ Music/video suggestions (switchable by user)
- ✅ Mood suggestions with pill-style UI
- ✅ Accessibility support (ARIA + keyboard nav)
- ✅ Fun hidden Easter egg and retro mini-game
- ✅ Fully responsive and fast

---

## 🚀 Live App

👉 [https://v0-basic-react-app-three.vercel.app/](https://v0-basic-react-app-three.vercel.app/)

---

## 🛠️ Tech Stack

- React (Vite)
- Tailwind CSS
- OpenAI API (for mood analysis and suggestions)
- Unsplash API (for image moodboards)
- YouTube/Spotify Embeds
- Deployed on Vercel

---

## 📦 Getting Started (Dev Setup)

```bash
# Clone the repository
git clone https://github.com/your-username/calmboard-ai.git
cd calmboard-ai

# Install dependencies
npm install

# Add your environment variables
touch .env.local
# Inside .env.local, add:
# REACT_APP_OPENAI_API_KEY=your_key_here

# Run the dev server
pnpm run dev
