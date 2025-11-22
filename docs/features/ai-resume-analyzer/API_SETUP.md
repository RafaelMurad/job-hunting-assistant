# API Setup Guide

How to get API keys for AI providers.

## Option 1: OpenAI (Recommended for beginners)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)
6. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

**Cost**: ~$0.15 per 1M input tokens for gpt-4o-mini

**Docs**: [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## Option 2: Anthropic (Claude)

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account
3. Navigate to **API Keys**
4. Create a new key
5. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

**Cost**: ~$0.25 per 1M input tokens for claude-3-haiku

**Docs**: [Anthropic API Reference](https://docs.anthropic.com/en/api)

---

## Option 3: Google AI (Gemini)

1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Sign in with Google account
3. Click **Get API key**
4. Create key in new or existing project
5. Add to `.env.local`:
   ```
   GOOGLE_AI_API_KEY=your-key-here
   ```

**Cost**: Free tier available, then ~$0.075 per 1M tokens

**Docs**: [Google AI for Developers](https://ai.google.dev/docs)

---

## Security Notes

- **Never commit API keys** to git
- Add `.env.local` to `.gitignore`
- Use environment variables in production (Vercel dashboard)
- Set up usage limits in provider dashboards
- Monitor usage to avoid unexpected charges

## Testing Without API Key

The feature works without an API key using mock responses. This is useful for:
- Development and testing
- Understanding the UI flow
- Learning the streaming pattern

The mock response simulates streaming with realistic timing.
