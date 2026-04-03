# 🌍 World Story Gen

A turn-based world history generator. Draw shapes on a map, describe your world's lore with AI, then simulate civilizations evolving through the ages.

## How to Play

1. **Open `index.html`** in a browser (no server needed)
2. **Draw regions** — click to place polygon points, click near the first point to close
3. **Chat with the AI** — describe your world's gods, creatures, magic in the lore panel (needs OpenRouter API key)
4. **Start simulation** — watch civilizations advance through ages, fight wars, and experience events

## Features

- 🗺️ **Map Drawing** — polygon-based region creation with colors and names
- 📜 **World Lore AI** — chat-powered world-building via OpenRouter (Qwen 3 235B)
- 🎲 **10% Age Regression** — every advancement attempt has a 10% chance to FALL BACK one age instead
- 🎬 **Dice Roll Animation** — see the roll result when stepping manually
- ⚔️ **Conflicts** — civilizations clash at borders, can conquer each other
- 🌋 **Random Events** — disasters, golden ages, discoveries (flavored by your lore)
- 📊 **History Timeline** — complete event log with world summary

## Ages

🪨 Stone → 🏺 Bronze → ⚔️ Iron → 🏛️ Classical → 🏰 Medieval → ⛵ Exploration → 🏭 Industrial → 💡 Modern → 🚀 Information

## Tech

Pure HTML/CSS/JS — no build tools, no dependencies, just open and play.

AI chat requires an [OpenRouter](https://openrouter.ai) API key (prompted on first use).
