const { TeamsActivityHandler, MessageFactory } = require('botbuilder');
const App = require('@voiceflow/runtime-client-js');

class VoiceflowBot extends TeamsActivityHandler {
  constructor() {
    super();

    let conversationEnded = false;
    let chatbot;

    async function initializeclient(forceRestart){

      if(chatbot === null || chatbot === undefined || forceRestart){
          chatbot = new App.default({
              versionID: process.env.VOICEFLOW_PROGRAM
          });
          return await chatbot.start();
      }
      return null;
    }
    
    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      console.log(context);
      let reply = ''; // markdown
      var initState;

      if(chatbot == null || context.activity.text == 'start' || context.activity.text == '/start'){
        initState = await initializeclient(true);

        if (initState != null && initState.getResponse()[0] != null){
          let initReplay = initState.getResponse()[0].payload.message
          await context.sendActivity(MessageFactory.text(initReplay)); 
          conversationEnded = false;
          // By calling next() you ensure that the next BotHandler is run.
          await next();
          return
        }
      }

      if(!conversationEnded){

        const newState = await chatbot.sendText(context.activity.text);
        
        if(newState.getResponse().length === 0){
          reply += "Sorry, I did not understand you. Can you repeat, please?"
        }else{
          reply = newState.getResponse()[0].payload.message;
        }

        if(newState.isEnding()){
          reply += "\nIf you want to start again just write /start"
            conversationEnded = true;
        }
      }else{
        reply = "\nThe Conversation has ended. If you want to start again just write /start"
      }
      await context.sendActivity(MessageFactory.text(reply)); 
      
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.VoiceflowBot = VoiceflowBot;
