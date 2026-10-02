# StudyTwin — Your Personal AI Study Buddy 🎓

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

---

## What I Built

**StudyTwin** is a lightweight, 100% private personal AI study buddy designed for students who find dense textbooks and dry documentation overwhelming.

### Who I Built It For & The Problem
I built StudyTwin specifically for my close friend **Rahul** (and anyone preparing for college exams or technical interviews). 

Whenever Rahul tries to learn difficult topics—like OOP Inheritance, Time Complexity, or Web Protocols—he runs into two major roadblocks:
1. **Academic Jargon & Textbook Overload:** Standard tutorials and textbooks use dry, overly theoretical language that makes simple concepts feel intimidating. Rahul learns best when concepts are explained casually in **Hinglish** (a blend of Hindi and English) with relatable analogies from hostel life, gaming, and daily situations.
2. **Passive Reading vs. Active Recall:** He often re-reads lecture slides multiple times without really knowing if he actually retained the concepts, and he hesitates to ask repetitive questions in class out of embarrassment.

### The Solution
StudyTwin gives Rahul a judgment-free, interactive study buddy:
- **Customizable Explanations:** Explains concepts in **Simple English**, friendly **Hinglish** (*"Bhai dekh, inheritance is just like..."*), or **Like I'm 10** (everyday metaphors).
- **Structured Learning Breakdowns:** Every explanation is broken into: *Core Idea in Plain Words*, *Real-Life Student Analogy*, *Clean Code / Concrete Example*, and *Key Takeaways*.
- **Interactive 5-Question Stepper Quiz:** Generates 5 multiple-choice questions on any topic, showing one question at a time with a live progress bar.
- **Why Wrong Answers are Wrong:** After finishing the quiz, it highlights not just the score and correct answers, but explains *why* the incorrect options were distractors to eliminate misconceptions.
- **Cognitive Study Hacks & Pomodoro:** Includes proven retention techniques (The Feynman Technique, Blurting Method, Spaced Repetition) and a built-in 25-minute Pomodoro focus timer.

---

## Demo

live link - https://study-twin-personal-study-buddy.vercel.app/

### Key Screenshots & UI Flow
- **Home & Dedication Banner:** Highlights the *"Built for a Friend"* personal story with an inline ✏️ customization tool to change the friend's name for anyone.
- **Ask AI Workspace:** Topic input with one-click popular exam chips, style toggles (Simple English / Hinglish / ELI10), and a one-click *"Practice in a Quiz"* bridge.
- **5-Question Stepper Quiz:** One question per card, animated progress bar, responsive option selection, and comprehensive post-quiz review.
- **Study Tips & Focus Timer:** Interactive 25:00 Pomodoro sprint tool and tailored AI study hacks.

To run the demo locally on your own machine:
```bash
git clone https://github.com/rudraism19/StudyTwin-Personal-Study-Buddy.git
cd StudyTwin-Personal-Study-Buddy
pip install -r requirements.txt
python app.py
```
Open **`http://127.0.0.1:5000`** in your browser.

---

## Code

You can view the full open-source codebase on GitHub:
👉 **[StudyTwin GitHub Repository](https://github.com/rudraism19/StudyTwin-Personal-Study-Buddy)**

### Clean & Minimal Architecture
The project adheres strictly to simple, robust engineering—no heavy databases, no cloud telemetry, no auth barriers:
- **Frontend:** Semantic HTML5, modern CSS3 (responsive flex/grid, dark theme, JetBrains Mono & Plus Jakarta Sans typography), vanilla JavaScript.
- **Backend:** Python + Flask with RESTful JSON endpoints.
- **Local AI Engine:** Ollama local REST API (`/api/generate`).
- **Resilient Fallback:** An intelligent offline demo engine ensures that if Ollama isn't running yet, all explanations, Hinglish styling, quizzes, and scoring remain 100% interactive and testable.

---

## How I Built It

### Local Open-Source AI (Ollama + Open-Weight LLMs)
StudyTwin is built entirely around **open-weight models** running locally via **Ollama**:
- **Primary Models:** `llama3.2:3b` and `qwen2.5:3b` (chosen for their ultra-fast local inference speed, low memory footprint on student laptops, and high reasoning quality).
- **Local Inference:** Queries `http://127.0.0.1:11434/api/generate` with zero data transmitted over the public internet.

### Prompt Engineering & Structured Output
1. **Hinglish Persona Prompting:** We tuned the system prompt to speak like an encouraging college senior, using natural conversational colloquialisms (*"Bhai dekh"*, *"Fundamentally"*, *"Mast example"*) while preserving technical keywords in English so students remain exam-ready.
2. **Strict Schema Quiz Generation:** For the quiz generator, the model is prompted with structured JSON requirements to produce a 5-element array with option arrays, 0-indexed correct answers, and thorough distractor explanations.
3. **Automated Verification:** Added an automated test suite (`test_app.py`) validating the API routes, fallback response structures, and question-option schema.

---

## Why Does Open Innovation Matter?

Open innovation and open-weight models are game-changers for student tools like StudyTwin:

1. **100% Data Privacy for Students:**  
   Students frequently paste proprietary university assignment prompts, unreleased exam prep notes, or personal questions into AI tools. Closed commercial APIs send this data to third-party corporate servers for storage and model training. With open-weight models on Ollama, everything stays confined to the student's laptop.

2. **Zero Financial Barriers for Education:**  
   College students cannot afford \$20/month subscription paywalls or pay-per-token API credit cards. Open innovation democratizes AI so any student with a basic laptop can have a personalized 24/7 tutor completely free.

3. **Freedom from Platform Lock-in:**  
   Open models empower developers to swap architectures easily—from `llama3.2` to `qwen2.5` to `mistral`—without changing a single line of application code or negotiating enterprise licensing agreements.

---

## My Agent Session

This project was built pair-programming with an autonomous AI coding assistant. The agent assisted in scaffolding the Flask architecture, designing the responsive CSS dark mode, tuning the Hinglish prompts, constructing the 5-question stepper UX, and implementing the resilient fallback system for offline testing.

---

## Prize Categories

- **Hacktoberfest Weekend Challenge: Build for a Friend**
- **Open-Source AI / Local Inference Track**
