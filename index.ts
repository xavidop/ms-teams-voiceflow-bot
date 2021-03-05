import { BotFrameworkAdapter } from 'botbuilder';
import express, { Request, Response } from 'express';
import { AddressInfo } from 'net';

// This bot's main dialog
import VoiceflowBotClient from './bot';


// Create HTTP server
const app = express();
const server = app.listen(process.env.PORT || 3978, () => {
  const { port } = server.address() as AddressInfo;
  console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

// Catch-all for errors.
const onTurnErrorHandler = async (context: any, error: any) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity('OnTurnError Trace', `${error}`, 'https://www.botframework.com/schemas/error', 'TurnError');

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Messaging endpoint - Listen for incoming requests.
app.post('/api/messages', (req: Request, res: Response) => {
  adapter.processActivity(req, res, async (context) => {
    // Route to main dialog.
    await VoiceflowBotClient.run(context);
  });
});
