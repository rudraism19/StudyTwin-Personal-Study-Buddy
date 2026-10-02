# StudyTwin — Your Personal AI Study Buddy 🎓

> **Hackathon Theme:** *"Build for a Friend"*  
> **100% Local • Private • Powered by Open-Weight LLMs (Ollama)**

---

## 🤝 The Story: Built for a Friend

- **Built for:** Rahul *(or customizable for your best friend!)*
- **Problem:** My friend struggles to understand difficult technical topics, gets overwhelmed by dense textbook jargon, and needs a simple, zero-pressure way to practice concepts and test retention.
- **Solution:** StudyTwin explains complex topics in their preferred style (**Simple English** or friendly **Hinglish** with relatable real-world analogies) and instantly generates interactive **5-question practice quizzes** that explain why answers are right or wrong.

---

## ✨ Core Features

### 1. 💡 Ask AI (Concept Explainer)
- Enter any topic (e.g., *"Explain inheritance in Java"*, *"What is Big O notation?"*, *"How does HTTPS work?"*).
- **Style Toggle:**
  - 🇬🇧 **Simple English:** Conversational, zero academic bloat, relatable student analogies.
  - 🇮🇳 **Hinglish:** Natural conversational Hindi-English buddy tone (*"Bhai dekh, inheritance simple words mein ye hai..."*).
  - 🎈 **Explain Like I'm 10:** Ultra-intuitive metaphors (pizza, legos, video games).
- Structured breakdown:
  - 💡 **Core Idea in Plain Words**
  - 🍕 **Real-Life Analogy**
  - 💻 **Concrete Example / Code**
  - 🔑 **Key Takeaways & Cheat Sheet**
- One-click **"Copy to Clipboard"** and **"Practice in a Quiz"** flow.

### 2. 🎯 Interactive 5-Question Quiz Stepper
- Generates **5 multiple-choice questions** on any topic.
- Clean **stepper UX**: displays **one question at a time** with a live progress bar.
- Interactive option selection (A, B, C, D) with clean hover and active states.
- **Instant Scoring & Review:**
  - Displays score badge (e.g., `4 / 5`) and personalized encouragement.
  - **Explains Incorrect Answers:** Comprehensive breakdown of every question detailing why the correct answer is right and where the distractors mislead.

### 3. ⚡ Study Tips & Retention Strategies
- **Personalized Hacks Generator:** Enter a specific tricky subject (e.g., *Operating Systems*, *Calculus*) to receive 4 actionable study techniques.
- **Science-Backed Frameworks:**
  - 👨‍🏫 *The Feynman Technique* (Retention: 90%)
  - ⏱️ *25/5 Pomodoro Cadence*
  - 📝 *The Blurting Method* (Active Recall)
  - 📅 *Spaced Repetition* (Overcoming the forgetting curve)
- **Built-in Pomodoro Timer:** 25-minute focus sprints directly in the browser.

### 4. 🔒 100% Private Local AI (Ollama)
- Uses local open-weight models via **Ollama** (e.g., `llama3.2`, `qwen2.5`, `llama3`).
- **No paid AI APIs, no cloud telemetry, no database bloat.**
- **Smart Offline Demo Fallback:** If Ollama is not installed or offline, StudyTwin automatically switches to an intelligent fallback engine so you and hackathon judges can immediately test the entire app and quizzes without breaking.

---

## 🛠️ Tech Stack

- **Frontend:** Semantic HTML5, Modern CSS3 (Dark Indigo aesthetic, responsive cards, JetBrains Mono & Plus Jakarta Sans), Vanilla JavaScript
- **Backend:** Python + Flask
- **AI Engine:** Ollama HTTP REST API (`/api/generate`)
- **LLM Models:** Open-weight `llama3.2` / `qwen2.5` / `llama3`

*Strictly no databases, no Redis, no auth walls, no Docker, and no complex agent frameworks — keeping the architecture clean, fast, and easy to run.*

---

## 📁 Project Structure

```text
StudyTwin-Personal-Study-Buddy/
├── app.py                  # Flask server with Ollama integration & offline fallback
├── requirements.txt        # Minimal dependencies (Flask, requests)
├── test_app.py             # Automated test suite for all endpoints
├── README.md               # Documentation & setup guide
├── static/
│   ├── css/
│   │   └── style.css       # Clean, modern student-friendly stylesheet
│   └── js/
│       └── app.js          # Client-side tabs, quiz stepper, tips & timer logic
└── templates/
    └── index.html          # Single-page responsive application
```

---

## 🚀 Quick Setup & Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/rudraism19/StudyTwin-Personal-Study-Buddy.git
cd StudyTwin-Personal-Study-Buddy
```

### Step 2: Install Python Dependencies
Make sure you have Python 3.9+ installed:
```bash
pip install -r requirements.txt
```

### Step 3: (Optional) Start Local LLM with Ollama
If you want StudyTwin to run entirely on your local machine with local LLMs:
1. Download Ollama from [ollama.com](https://ollama.com).
2. Pull and start your preferred open-weight model:
   ```bash
   ollama run llama3.2
   # OR
   ollama run qwen2.5
   ```
*(Note: If Ollama is not running, StudyTwin will seamlessly activate its built-in Smart Demo Mode so all features remain functional!)*

### Step 4: Run the Application
```bash
python app.py
```

### Step 5: Open in Your Browser
Visit:  
👉 **`http://127.0.0.1:5000`**

---

## 🧪 Running Automated Tests

Run the built-in test suite to verify all endpoints, quiz generation, Hinglish mode, and template rendering:

```bash
python test_app.py
```

---

## 💡 Hackathon Notes: "Build for a Friend"

StudyTwin was designed with empathy for a real student friend:
- **Zero Judgment:** Safe space to ask questions multiple times without feeling silly.
- **Language Comfort:** Switching between Hinglish and Simple English removes cognitive friction.
- **Gamified Validation:** The 5-question stepper turns passive reading into active retention.
- **Customizable Dedication:** Click the ✏️ pencil icon next to "Built for: Rahul" on the home page to personalize the name for your own friend!