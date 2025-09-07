# Jarvis GPT - Setup Instructions

## Quick Start

Follow these steps to get Jarvis GPT running on your machine:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
REACT_APP_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Run the Application

```bash
npm start
```

This will build the React app and launch the Electron desktop application.

## Getting Your OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Optional: Supabase Setup

For cloud chat history, you can optionally set up Supabase:

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > API to get your URL and anon key
4. Add them to your `.env` file:
   ```env
   REACT_APP_SUPABASE_URL=your-project-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Create the chats table in your database:
   ```sql
   CREATE TABLE chats (
     id UUID PRIMARY KEY,
     title TEXT NOT NULL,
     messages JSONB NOT NULL DEFAULT '[]',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## Troubleshooting

If you encounter issues:

1. **Node.js Version**: Ensure you're using Node.js v16 or higher
2. **API Key**: Double-check your OpenAI API key is correct
3. **Dependencies**: Try `rm -rf node_modules && npm install`
4. **Permissions**: On macOS/Linux, you might need to run with appropriate permissions

## Need Help?

Check the main README.md file for detailed documentation and troubleshooting guides.
