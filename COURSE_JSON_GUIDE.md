# French Course - JSON Topic Creation Guide

## Overview

The French Course feature now supports **JSON-based topic creation**, which is the **recommended and most reliable method** for adding course topics.

## Why JSON Mode?

✅ **100% Reliable** - No parsing errors
✅ **Structured Data** - Predictable format
✅ **Easy to Use** - Copy, paste, done
✅ **ChatGPT Friendly** - Perfect for AI generation
✅ **No Formatting Issues** - Everything is validated automatically

## How to Create a Topic (Step-by-Step)

### Step 1: Copy the JSON Template

Click the **"Copy Template"** button in the app, or copy this:

```json
{
  "semester": "1",
  "topic_title": "Numbers 0-100",
  "introduction": "French numbers from 0 to 100 follow specific patterns with some irregularities.",
  "content": "Numbers 0-16 are unique and must be memorized. Numbers 17-19 are formed using 'dix + number'. Tens (20-60) follow a regular pattern. Numbers 70-99 use combinations of 60 and 20.",
  "vocabulary": ["zéro", "un", "deux", "trois", "quatre", "cinq"],
  "examples": [
    {
      "french": "J'ai vingt-et-un ans.",
      "english": "I am twenty-one years old."
    },
    {
      "french": "Il y a trente-cinq étudiants.",
      "english": "There are thirty-five students."
    }
  ],
  "notes": "Use 'et' (and) only with numbers ending in 1 (21, 31, 41, etc.). Hyphens are used in compound numbers.",
  "youtube_link": "https://www.youtube.com/watch?v=example",
  "pdf_link": "https://drive.google.com/file/d/example/view"
}
```

### Step 2: Use This ChatGPT Prompt

Copy and paste this prompt into ChatGPT along with your textbook content:

```
Extract the topic from my textbook content and return ONLY JSON in this exact structure. 
No explanation, no extra text. Just the JSON object.

{
  "semester": "1",
  "topic_title": "Topic Title Here",
  "introduction": "Brief introduction to the topic",
  "content": "Detailed content about the topic",
  "vocabulary": ["word1", "word2", "word3"],
  "examples": [
    {
      "french": "French example sentence",
      "english": "English translation"
    }
  ],
  "notes": "Important notes about the topic",
  "youtube_link": "YouTube video URL",
  "pdf_link": "Google Drive PDF URL"
}
```

### Step 3: Paste Your Textbook Content

After the prompt, add your textbook content. For example:

```
Here is my textbook content about French numbers:

[ Paste your textbook page content here ]
```

### Step 4: Copy ChatGPT's Response

ChatGPT will return a perfectly formatted JSON object like this:

```json
{
  "semester": "1",
  "topic_title": "Les Nombres de 0 à 100",
  "introduction": "French numbers from 0 to 100 follow specific patterns...",
  "content": "Numbers 0-16 are unique...",
  "vocabulary": ["zéro", "un", "deux", "trois"],
  "examples": [
    {
      "french": "J'ai vingt-et-un ans.",
      "english": "I am twenty-one years old."
    }
  ],
  "notes": "Use 'et' only with numbers ending in 1",
  "youtube_link": "https://www.youtube.com/watch?v=b1eKOe-DsC4",
  "pdf_link": "https://drive.google.com/file/d/1HCP9dqNo9Kkt0AZOfJ85JlRjfUn-Ff7u/view"
}
```

### Step 5: Paste JSON into the App

1. Go to **French Course** → **Add Topic**
2. Make sure **JSON (Recommended)** mode is selected
3. Paste the JSON into the text box
4. Click **"Add Topic from JSON"**
5. Done! ✅

## JSON Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `semester` | Yes | Semester number (1-8) |
| `topic_title` | Yes | Title of the topic |
| `introduction` | Yes | Brief intro (use `\n\n` for paragraph breaks) |
| `content` | Yes | Main content (use `•` for bullets, `\n\n` for sections) |
| `vocabulary` | No | Array of vocabulary words |
| `examples` | Yes | Array of French/English examples |
| `notes` | No | Important notes (use `\n` for line breaks) |
| `youtube_link` | Yes | YouTube video URL |
| `pdf_link` | Yes | Google Drive PDF URL |

## Formatting Tips for Readable Content

### ⚠️ CRITICAL: Use ACTUAL Line Breaks!

When ChatGPT returns the JSON, make sure it uses **real line breaks** (pressing Enter), NOT the text `\n`.

**❌ WRONG (don't use \n text):**
```json
"content": "Line 1.\n\nLine 2."
```

**✅ CORRECT (use actual line breaks):**
```json
"content": "Line 1.

Line 2."
```

### Tell ChatGPT:
```
IMPORTANT: Use ACTUAL line breaks in the JSON string values. 
Press Enter to create new lines, don't write the text "\n".
```

### Use `•` for Bullet Points
```json
"content": "📌 SECTION TITLE:
• Point one
• Point two

📌 ANOTHER SECTION:
• Point three
• Point four"
```

### Use Emojis for Visual Sections
- 📌 For main sections
- ⚠️ For warnings
- 💡 For tips
- 📝 For notes
- ✨ For highlights

## Example: Complete Topic (Well-Formatted)

Here's a complete example with proper formatting:

```json
{
  "semester": "1",
  "topic_title": "French Greetings",
  "introduction": "French greetings vary based on formality and time of day.\n\nIn French culture, proper greetings are essential for polite conversation.",
  "content": "📌 BASIC GREETINGS:\n• Bonjour - Hello/Good day (formal)\n• Bonsoir - Good evening (formal)\n• Salut - Hi/Bye (informal)\n\n📌 FAREWELLS:\n• Au revoir - Goodbye\n• À bientôt - See you soon\n• Bonne nuit - Good night\n\n📌 USAGE TIPS:\n• Use 'vous' for formal situations\n• Use 'tu' for friends and family",
  "vocabulary": ["bonjour", "bonsoir", "salut", "au revoir", "bonne nuit"],
  "examples": [
    {
      "french": "Bonjour, comment allez-vous?",
      "english": "Hello, how are you? (formal)"
    },
    {
      "french": "Salut! Ça va?",
      "english": "Hi! How's it going? (informal)"
    }
  ],
  "notes": "⚠️ Important:\n• Always greet before asking questions\n• 'Bonjour' is used until evening\n• 'Bonsoir' after 6 PM",
  "youtube_link": "https://www.youtube.com/watch?v=example",
  "pdf_link": "https://drive.google.com/file/d/example/view"
}
```

## Troubleshooting

### Error: "Invalid JSON"
- Make sure there are no trailing commas
- Ensure all quotes are properly closed
- Check that brackets match: `{ }` and `[ ]`
- Use a JSON validator like https://jsonlint.com/

### Error: "Missing required fields"
- Check that all required fields are present
- Field names must be exact (use underscores, not spaces)
- `examples` must be an array with `french` and `english` properties

### Error: "Invalid YouTube link"
- Must be a full YouTube URL
- Examples:
  - ✅ `https://www.youtube.com/watch?v=abc123`
  - ✅ `https://youtu.be/abc123`
  - ❌ `youtube.com/watch?v=abc123` (missing https)

## Adding Assignments/Quizzes to Topics

After creating a topic with JSON, you can add assignments/quizzes separately:

1. Go to **Create Assignment** or **Create Quiz** in the main menu
2. Use the traditional format for questions
3. Select the appropriate semester

## Tips for Best Results

1. **Be Specific in ChatGPT**: Tell it exactly what topic you want
2. **Include Examples**: The more examples, the better
3. **Review Before Pasting**: Check the JSON output before submitting
4. **Save Your Templates**: Keep a library of good prompts
5. **Test with Simple Topics First**: Start with basic topics to verify the workflow

## Manual Mode (Alternative)

If you prefer the traditional form-based input:

1. Click **"Manual Form"** tab
2. Fill in each field manually
3. Use the text templates for assignments/quizzes

However, **JSON mode is recommended** for consistency and reliability.

## Support

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Validate your JSON at https://jsonlint.com/
3. Ensure all URLs are complete and accessible
