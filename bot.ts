import RuntimeClientFactory, { Context as VFContext, TraceType } from '@voiceflow/runtime-client-js';
import { MessageFactory, TeamsActivityHandler, TurnContext } from 'botbuilder';
import dotenv from 'dotenv';

import kvstore from './store';

class VoiceflowBot extends TeamsActivityHandler {
  private factory: RuntimeClientFactory;

  getClient = async (ctx: TurnContext) => {
    const senderID = ctx.activity!.id!.toString();
    const state = await kvstore.get(senderID);
    return this.factory.createClient(state);
  };

  response = async (ctx: TurnContext, VFctx: VFContext) => {
    const senderID = ctx.activity!.id!.toString();
    await kvstore.set(senderID, VFctx.toJSON().state);

    // eslint-disable-next-line no-restricted-syntax
    for (const trace of VFctx.getTrace()) {
      if (trace.type === TraceType.SPEAK) {
        console.log(JSON.stringify(trace.payload));
        // eslint-disable-next-line no-await-in-loop
        await ctx.sendActivity(MessageFactory.text(trace.payload.message));
      }
      if (trace.type === TraceType.VISUAL && trace.payload.visualType === 'image') {
        console.log(JSON.stringify(trace.payload));
        // eslint-disable-next-line no-await-in-loop
        await ctx.sendActivity(MessageFactory.contentUrl(trace.payload.image!, 'image/png'));
      }
    }
  };

  constructor() {
    super();
    dotenv.config();
    this.factory = new RuntimeClientFactory({
      versionID: process.env.VOICEFLOW_VERSION_ID!, // voiceflow project versionID
      apiKey: process.env.VOICEFLOW_API_KEY!, // voiceflow api key
      endpoint: process.env.VOICEFLOW_RUNTIME_ENDPOINT,
    });

    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (ctx: TurnContext, next) => {
      console.log(ctx);
      const client = await this.getClient(ctx);
      const context = await client.sendText(ctx.activity.text);
      await this.response(ctx, context);

      // By calling next() you ensure that the next BotHandler is run.
      // eslint-disable-next-line callback-return
      await next();
    });
  }
}

// Create the main dialog.
const VoiceflowBotClient = new VoiceflowBot();

export default VoiceflowBotClient;
