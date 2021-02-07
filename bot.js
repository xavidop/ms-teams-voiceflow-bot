const { TeamsActivityHandler, MessageFactory } = require('botbuilder');

class ReverseBot extends TeamsActivityHandler {
  constructor() {
    super();
    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      const backward = [...context.activity.text].reverse().join(''); // reverse string
      console.log(context);
      const replyText = `🙃 *${ backward }*`; // markdown
      await context.sendActivity(MessageFactory.text(replyText)); 
      
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.ReverseBot = ReverseBot;
