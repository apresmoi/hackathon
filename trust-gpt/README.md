# Improving Hackathon Project

This is a Next.js project that integrates with OpenAI and Slack APIs.

Project Design: [v0.dev/chat/trust-gpt-chat-app-kEcIe2ghY2Y](https://v0.dev/chat/trust-gpt-chat-app-kEcIe2ghY2Y)

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd improving-hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following environment variables:
```env
OPENAI_API_KEY=your_openai_api_key
SLACK_BOT_TOKEN=your_slack_bot_token
```

## Running the Project

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key
- `SLACK_BOT_TOKEN`: Your Slack Bot User OAuth Token

Make sure to keep these values secure and never commit them to version control. 