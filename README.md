
# 📝 Quiz / Aptitude Module

> ⚠️ **Note:** This module is part of the **Neuro Campus Major Project**.
> It is **not a standalone application** and can only be accessed through the main project: [Neuro Campus](https://github.com/Yug-Bothra/NEURO_CAMPUS).

## 🌟 Overview

This module provides an **AI-powered aptitude and quiz system** for students. It is integrated with the **Neuro Campus platform** to deliver personalized testing and performance tracking.

**Data Source:**

* The quiz questions are stored in a **CSV file** (`public/questions.csv`)
* It contains **high-level aptitude questions** spanning logical reasoning, quantitative ability, and verbal skills.
* The module **fetches the data dynamically** from this CSV file to populate quizzes.

## 🛠️ Folder Structure

```
quizz/
├── node_modules/          # Dependencies
├── public/                # Static assets
│   └── questions.csv      # High-level aptitude questions
├── src/                   # Source code
│   ├── assets/            # Images and media
│   ├── component/         # Quiz components
│   │   ├── QuizApp.jsx
│   │   ├── QuizDashboard.jsx
│   │   └── quizService.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── supabaseClient.js
├── .env                   # Environment variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 🚀 Quick Start

1. **Clone the main Neuro Campus repository**

   ```bash
   git clone https://github.com/Yug-Bothra/NEURO_CAMPUS
   ```
2. **Navigate to the quiz module**

   ```bash
   cd NEURO_CAMPUS/quizz
   ```
3. **Install dependencies**

   ```bash
   npm install
   ```
4. **Start the development server**

   ```bash
   npm run dev
   ```
5. **Open in browser**

   ```
   http://localhost:5173
   ```

## 🔗 Integration

* The quiz module **fetches questions from `questions.csv`** in the public folder.
* It relies on the **Neuro Campus authentication system** for user verification.
* **Results are stored and tracked** via the main project's **Supabase backend**.

---

## 🔗 Important Links

* **Major Project Repository:** [https://github.com/Yug-Bothra/NEURO\_CAMPUS](https://github.com/Yug-Bothra/NEURO_CAMPUS)
* **Live Demo of Major Project:** [https://neuro-campus-73w8.vercel.app](https://neuro-campus-73w8.vercel.app)

---

**❤️ Made with love by Yug Bothra**

---
