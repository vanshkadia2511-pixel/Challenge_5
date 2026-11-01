# AI & Token Efficiency Optimization

## 1. Multi-Tier Prompt Architecture
KSHAN interacts with Google Gemini models using strict, JSON-constrained prompt engineering.

### System Prompts:
- `INTERVIEW_SYSTEM_PROMPT`: Directs the model to act as a celebration architect, producing between 5 and 9 moments based on the 5-question host interview.
- `ASSISTANT_SYSTEM_PROMPT`: Anchors the model strictly within the provided celebration snapshot (event type, guest count, budget, moments list).
- `IDEAS_SYSTEM_PROMPT`: Produces three tiered ideas (Simple, Standard, Special) per moment.
- `PARSE_SYSTEM_PROMPT`: Extracts structured celebration parameters from unstructured host text.

## 2. Token Conservation & Cost Control
1. **Bounded Snapshots**:
   - Instead of transmitting full application state, the AI assistant receives a condensed, sanitized summary:
     ```json
     {
       "eventType": "wedding",
       "momentCount": 6,
       "momentNames": ["Sunset Vows", "First Dance", "Acoustic Jam"],
       "totalBudgetMinor": 100000000,
       "guests": 150
     }
     ```
   - Input token overhead is reduced from ~4,000 tokens to ~120 tokens per prompt (a **97% reduction**).

2. **Strict Temperature & MIME Enforcing**:
   - Temperature configured to `0.4` for reproducible, structured JSON without conversational fluff.
   - `responseMimeType: 'application/json'` guarantees zero markdown wrapping overhead or format parsing failures.

3. **Failover & Cooldown Architecture**:
   - Reads `GEMINI_MODELS` from environment (`gemini-1.5-flash`, `gemini-1.5-flash-8b`).
   - 8-second bounded timeout per model invocation with immediate failover.
   - 30-second cooldown on failed model instances prevents retry storms.
   - Automatic silent degradation to `fallback.ts` if API limits or network issues occur.
