import os
import sys
import json
import re
import requests
from flask import Flask, render_template, request, jsonify

# Windows cp1252 stdout encoding safeguard
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

app = Flask(__name__)

# Ollama Configuration
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")


def check_ollama_status():
    """Check if the local Ollama instance is running and get installed models."""
    try:
        res = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
        if res.status_code == 200:
            data = res.json()
            models = [m.get("name") for m in data.get("models", [])]
            return True, models
    except Exception:
        pass
    return False, []


def call_ollama(prompt, model=None, system_prompt=None, format_json=False):
    """
    Call Ollama API with fallback handling.
    Returns (success, response_text_or_error)
    """
    target_model = model or DEFAULT_MODEL
    payload = {
        "model": target_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
        }
    }
    if system_prompt:
        payload["system"] = system_prompt
    if format_json:
        payload["format"] = "json"

    try:
        res = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=90)
        if res.status_code == 200:
            result = res.json()
            return True, result.get("response", "")
        else:
            return False, f"Ollama error: HTTP {res.status_code} - {res.text}"
    except requests.exceptions.ConnectionError:
        return False, "OLLAMA_OFFLINE"
    except requests.exceptions.Timeout:
        return False, "OLLAMA_TIMEOUT"
    except Exception as e:
        return False, str(e)


# ==========================================
# SMART FALLBACK RESPONSES (FOR OFFLINE / DEMO)
# ==========================================

DEMO_EXPLANATIONS = {
    "inheritance": {
        "simple_english": """### 💡 Core Idea in Plain English
**Inheritance** in Object-Oriented Programming is like passing down traits in a family. A child class automatically inherits attributes and methods from a parent class, so you don't have to rewrite the same code again!

### 🍕 Real-Life Analogy
Imagine a **Vehicle** is the parent. It has wheels and can move. 
A **Car** is a child of Vehicle. It inherits wheels and movement, but adds air conditioning and a trunk. A **Bicycle** also inherits from Vehicle, but adds pedals!

### 💻 Code Example (Java)
```java
// Parent Class
class Animal {
    void eat() {
        System.out.println("This animal eats food.");
    }
}

// Child Class inherits Animal using 'extends'
class Dog extends Animal {
    void bark() {
        System.out.println("Woof! Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.eat();  // Inherited from Animal!
        myDog.bark(); // Defined in Dog
    }
}
```

### 🔑 Key Takeaways
- Use the `extends` keyword in Java.
- Promotes **Code Reusability** (Don't Repeat Yourself).
- Child classes can override parent methods to customize behavior.""",
        "hinglish": """### 💡 Seedhi Baat (Core Idea)
**Inheritance** ka simple matlab hai: Baap ki property bete ko milna! 
Programming mein jab ek nayi class (Child Class) kisi existing class (Parent Class) ke features aur methods ko use karti hai bina dobara code likhe, use Inheritance bolte hain.

### 🍕 Asli Zindagi Ka Example
Socho ek parent class hai **Smartphone**. Usme calling, SMS aur camera pehle se hai.
Ab agar **iPhone** ya **Samsung** nayi class banti hai, toh unhe calling aur SMS code dobara likhne ki zaroorat nahi. Wo Smartphone class ko **inherit** kar lenge aur bas apne unique features (jaise FaceID ya S-Pen) add karenge!

### 💻 Code Example (Java)
```java
// Parent Class
class Vehicle {
    void startEngine() {
        System.out.println("Gadi start ho gayi!");
    }
}

// Child Class - 'extends' use karke inherit kiya
class Bike extends Vehicle {
    void kickStart() {
        System.out.println("Kick maari aur bike start!");
    }
}

public class Main {
    public static void main(String[] args) {
        Bike bullet = new Bike();
        bullet.startEngine(); // Parent se mila!
        bullet.kickStart();   // Bike ka apna feature
    }
}
```

### 🔑 Yaad Rakhne Wali Cheezein
- Java mein `extends` keyword use hota hai.
- Code reuse hota hai, time bachta hai.
- Multiple inheritance classes ke through Java direct support nahi karta (interfaces use hote hain)."""
    }
}

DEMO_QUIZZES = {
    "inheritance": [
        {
            "question": "Which Java keyword is used to inherit a class from a parent class?",
            "options": [
                "implements",
                "extends",
                "inherits",
                "super"
            ],
            "correct_index": 1,
            "explanation": "'extends' is the Java keyword used for class inheritance. 'implements' is used for interfaces, while 'super' is used to refer to parent class members."
        },
        {
            "question": "What is the primary benefit of using Inheritance in OOP?",
            "options": [
                "It makes the program run at double speed",
                "It automatically encrypts memory variables",
                "It promotes code reusability and clean hierarchy",
                "It eliminates the need for constructors"
            ],
            "correct_index": 2,
            "explanation": "Code reusability is the main benefit. Child classes inherit tested code from parent classes without rewriting it."
        },
        {
            "question": "Can a Java class directly extend more than one parent class (Multiple Inheritance)?",
            "options": [
                "Yes, using commas like 'class C extends A, B'",
                "No, Java does not support multiple class inheritance directly",
                "Yes, but only if all classes are abstract",
                "Yes, in Java 17 and above"
            ],
            "correct_index": 1,
            "explanation": "To prevent the 'Diamond Problem' (ambiguity about which parent method to call), Java prohibits multiple class inheritance. It achieves this via interfaces instead."
        },
        {
            "question": "What does the 'super' keyword do in a child class in Java?",
            "options": [
                "Calls or references the parent class's constructor or methods",
                "Creates a new superuser thread",
                "Prevents any subclass from modifying the variable",
                "Deletes parent class methods"
            ],
            "correct_index": 0,
            "explanation": "'super' refers directly to the immediate parent class, commonly used as 'super()' to invoke the parent constructor."
        },
        {
            "question": "When a child class redefines a method that already exists in its parent with the same signature, this is called:",
            "options": [
                "Method Overloading",
                "Method Overriding",
                "Encapsulation",
                "Polymorphic Compilation"
            ],
            "correct_index": 1,
            "explanation": "Method Overriding happens when a subclass provides a specific implementation of a method already provided by its superclass. Overloading is having same method name with different parameters."
        }
    ]
}


def generate_fallback_explanation(topic, style="simple_english"):
    """Generate a clean structured fallback explanation when Ollama is offline."""
    clean_topic = topic.strip().lower()
    for key, data in DEMO_EXPLANATIONS.items():
        if key in clean_topic:
            return data.get(style, data["simple_english"])

    if style == "hinglish":
        return f"""### 💡 Seedhi Baat: {topic.title()}
**{topic.title()}** ek bahut important concept hai. Aasan bhasha mein kahein toh ye concept humein problems ko simplify aur organize karne mein help karta hai.

### 🍕 Asli Zindagi Ka Analogy
Socho jaise library mein saari books category wise rack mein rakhi hoti hain, taaki jab zaroorat ho turant mil jaye. The same way, **{topic}** bhi cheezon ko structure deta hai taaki complex systems easily samajh aa sakein!

### 🔑 Important Points (Bhai ye yaad rakhna)
1. **Foundation First**: Pehle basics pakdo, phir advanced deep-dive karo.
2. **Real Use-Case**: Dekho ye industry mein kahan kaam aata hai.
3. **Practice**: Khud 2-3 examples likh ke dekho ya quiz solve karo!

*(Note: StudyTwin Smart Offline Fallback Mode. Start Ollama locally for custom deep LLM generations!)*"""
    else:
        return f"""### 💡 Core Idea in Plain English: {topic.title()}
**{topic.title()}** is a foundational concept designed to solve specific challenges by breaking them into manageable, intuitive parts.

### 🍕 Real-Life Analogy
Think of {topic} like a well-organized toolbox or kitchen recipe. Instead of reinventing the wheel every single time you cook or build, you have established building blocks and clear procedures to get reliable results.

### 🔑 Key Takeaways
1. **Core Purpose**: Understand why this concept was invented and what friction it removes.
2. **Building Blocks**: Master the elementary terms before stringing together complex patterns.
3. **Active Practice**: Test your retention right away using the quiz generator below!

*(Note: StudyTwin Smart Offline Fallback Mode. Start Ollama locally for custom deep LLM generations!)*"""


def generate_fallback_quiz(topic):
    """Generate 5 quality multiple-choice questions when Ollama is offline."""
    clean_topic = topic.strip().lower()
    for key, questions in DEMO_QUIZZES.items():
        if key in clean_topic:
            return questions

    # General high-quality conceptual questions for the topic
    return [
        {
            "question": f"What is the foundational objective or main purpose of {topic.title()}?",
            "options": [
                f"To solve practical problems and improve system structure/clarity",
                f"To increase file sizes and make code harder to read",
                f"To replace human logic entirely with zero configuration",
                f"It is an obsolete concept with no practical application today"
            ],
            "correct_index": 0,
            "explanation": f"The primary purpose of {topic.title()} is problem-solving, structural organization, and efficiency. Option B and D are incorrect because it simplifies rather than complicates, and it remains widely relevant."
        },
        {
            "question": f"When learning or implementing {topic.title()}, what is the recommended best practice?",
            "options": [
                "Memorizing syntax without understanding the underlying logic",
                "Skipping fundamentals and jumping directly to edge cases",
                "Understanding the core principles and verifying with hands-on practice",
                "Never testing or validating assumptions"
            ],
            "correct_index": 2,
            "explanation": "Active learning and hands-on validation solidify mental models. Rote memorization (Option A) fails when real-world requirements change."
        },
        {
            "question": f"Which of the following best describes the real-world utility of {topic.title()}?",
            "options": [
                "It provides modularity, clarity, and predictable outcomes",
                "It introduces random behavior without guarantees",
                "It only works on paper and cannot be executed",
                "It forces developers to abandon all standard conventions"
            ],
            "correct_index": 0,
            "explanation": "Modularity and predictability are hallmark traits of standard technical concepts. Option B and C are incorrect misconceptions."
        },
        {
            "question": f"What is a common pitfall students face when studying {topic.title()}?",
            "options": [
                "Treating it as isolated facts instead of connecting it to broader concepts",
                "Writing clean notes and self-quizzing",
                "Asking questions when stuck",
                "Explaining the concept to a friend"
            ],
            "correct_index": 0,
            "explanation": "Treating concepts in silos hinders deep comprehension. Active recall and teaching a friend (Options B, C, D) are proven effective strategies."
        },
        {
            "question": f"How can you verify that you have truly mastered {topic.title()}?",
            "options": [
                "By being able to explain it simply to someone else with zero jargon",
                "By reading the textbook page once without looking away",
                "By avoiding any quizzes or practical problems",
                "By waiting until the night before the exam to study"
            ],
            "correct_index": 0,
            "explanation": "The Feynman Technique states that if you can explain a topic in plain terms to a beginner or friend, you truly understand it. Cramming and avoiding quizzes (Options B, C, D) provide false confidence."
        }
    ]


# ==========================================
# ROUTES
# ==========================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status", methods=["GET"])
def api_status():
    """Check Ollama connectivity and return available models."""
    online, models = check_ollama_status()
    return jsonify({
        "ollama_online": online,
        "models": models,
        "default_model": DEFAULT_MODEL,
        "base_url": OLLAMA_BASE_URL
    })


@app.route("/api/explain", methods=["POST"])
def api_explain():
    """Explain a topic with simple beginner-friendly breakdown."""
    data = request.get_json() or {}
    topic = data.get("topic", "").strip()
    style = data.get("style", "simple_english")
    model = data.get("model") or DEFAULT_MODEL

    if not topic:
        return jsonify({"error": "Topic cannot be empty"}), 400

    system_prompt = (
        "You are StudyTwin, an encouraging, friendly, and patient personal AI study buddy. "
        "Your mission is to help a college friend understand difficult subjects easily. "
        "Always structure your explanation cleanly with:\n"
        "1. 💡 Core Idea in Plain Words (clear, zero gatekeeping)\n"
        "2. 🍕 Real-Life Student Analogy (pizza, hostel, gaming, college life, cars, etc.)\n"
        "3. 💻 Concrete Example or Code (if technical, brief and crystal clear)\n"
        "4. 🔑 Key Takeaways (3 concise bullet points)\n"
    )

    if style == "hinglish":
        system_prompt += (
            "\nLANGUAGE STYLE: HINGLISH (Natural Hindi-English student slang). "
            "Talk like a supportive college senior or close classmate (use words like 'Bhai', 'Dekh simple hai', "
            "'Fundamentally', 'Basically', 'Mast example'). Keep technical terms in English so concepts remain exam-ready."
        )
    elif style == "eli10":
        system_prompt += (
            "\nLANGUAGE STYLE: EXPLAIN LIKE I'M 10. "
            "Use ultra-simple vocabulary, playful metaphors (legos, superheroes, video games), and zero jargon."
        )
    else:
        system_prompt += (
            "\nLANGUAGE STYLE: SIMPLE ENGLISH. "
            "Conversational, beginner-friendly, warm, clear, without academic bloat."
        )

    prompt = f"Explain this topic thoroughly yet simply: '{topic}'"

    success, response = call_ollama(prompt, model=model, system_prompt=system_prompt)

    if success and response:
        return jsonify({
            "success": True,
            "topic": topic,
            "style": style,
            "explanation": response,
            "source": "ollama",
            "model": model
        })
    else:
        # Fallback to high-quality smart curated explanation
        fallback_text = generate_fallback_explanation(topic, style)
        return jsonify({
            "success": True,
            "topic": topic,
            "style": style,
            "explanation": fallback_text,
            "source": "fallback",
            "model": "Smart Study Engine (Ollama Offline)",
            "ollama_error": response if response != "OLLAMA_OFFLINE" else "Ollama is not running locally"
        })


@app.route("/api/quiz", methods=["POST"])
def api_quiz():
    """Generate 5 multiple-choice questions for a topic."""
    data = request.get_json() or {}
    topic = data.get("topic", "").strip()
    model = data.get("model") or DEFAULT_MODEL

    if not topic:
        return jsonify({"error": "Topic cannot be empty"}), 400

    system_prompt = (
        "You are an expert tutor creating a 5-question multiple choice practice quiz for a student. "
        "Generate EXACTLY 5 high-quality conceptual questions testing true understanding (not just trivial trivia). "
        "For each question, provide 4 options, the 0-indexed correct option, and a thorough explanation explaining "
        "WHY the correct answer is right AND why the other options are wrong/distractors. "
        "You MUST respond ONLY with a valid JSON array of 5 objects matching this exact schema, with no surrounding conversation:\n"
        "[\n"
        "  {\n"
        '    "question": "Clear question text?",\n'
        '    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '    "correct_index": 0,\n'
        '    "explanation": "Why Option A is correct and why other choices are wrong."\n'
        "  }\n"
        "]"
    )

    prompt = f"Generate a 5-question multiple-choice quiz on the topic: '{topic}'"

    success, response = call_ollama(prompt, model=model, system_prompt=system_prompt, format_json=True)

    questions = []
    if success and response:
        try:
            # Extract JSON from potential markdown wrappers
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            parsed = json.loads(cleaned)
            if isinstance(parsed, dict) and "questions" in parsed:
                parsed = parsed["questions"]
            if isinstance(parsed, list) and len(parsed) > 0:
                for q in parsed:
                    if "question" in q and "options" in q and "correct_index" in q:
                        questions.append({
                            "question": q["question"],
                            "options": q["options"],
                            "correct_index": int(q["correct_index"]),
                            "explanation": q.get("explanation", "Good job! That is the correct concept.")
                        })
        except Exception:
            questions = []

    if questions and len(questions) >= 3:
        return jsonify({
            "success": True,
            "topic": topic,
            "questions": questions[:5],
            "source": "ollama",
            "model": model
        })

    # Fallback to pre-built / smart question bank
    fallback_q = generate_fallback_quiz(topic)
    return jsonify({
        "success": True,
        "topic": topic,
        "questions": fallback_q,
        "source": "fallback",
        "model": "Smart Study Engine (Ollama Offline)"
    })


@app.route("/api/tips", methods=["POST"])
def api_tips():
    """Provide personalized study tips and retention strategies."""
    data = request.get_json() or {}
    topic = data.get("topic", "").strip() or "general study"
    model = data.get("model") or DEFAULT_MODEL

    system_prompt = (
        "You are StudyTwin, an empathetic study coach. Provide 4 actionable, high-impact study tips "
        "tailored to the student's topic. Format as clean bullet points with engaging emojis."
    )
    prompt = f"Give me 4 actionable study techniques to master: '{topic}'"

    success, response = call_ollama(prompt, model=model, system_prompt=system_prompt)

    if success and response:
        return jsonify({
            "success": True,
            "tips": response,
            "source": "ollama"
        })

    # Default practical tips
    default_tips = [
        "**The Feynman Technique**: Teach the topic in plain English or Hinglish to your friend or even an empty chair. The moment you struggle to explain a sentence, that's your exact learning gap!",
        "**25/5 Pomodoro Cycle**: Study for 25 focused minutes with zero phone notifications, then take a 5-minute break. After 4 cycles, take a longer 20-minute rest.",
        "**Active Recall over Re-reading**: Don't just stare at your lecture slides. Close the notes and try to draw the architecture or write key equations from memory.",
        "**Spaced Repetition**: Review this topic tomorrow for 5 minutes, then 3 days later, then a week later to shift it from short-term to permanent memory."
    ]
    return jsonify({
        "success": True,
        "tips": "\n\n".join([f"✨ {t}" for t in default_tips]),
        "source": "fallback"
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[StudyTwin] Server active and running at: http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
