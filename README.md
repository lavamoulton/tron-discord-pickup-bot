# discord-pickup-bot
This is a simple node Discord bot for organising pickup games, which is set up to be specific to [Armagetron Advanced](http://www.armagetronad.org). This is a forked repo, and was not originally written by me. This project uses [discord.js](https://github.com/discordjs/discord.js).

## Running the bot
To run locally, clone the repo, then run `npm install` and `node main.js`. You need to have DISCORD_TOKEN in env (e.g. `export DISCORD_TOKEN='Your token here'`).

### Getting a Discord token (setting up a bot user in Discord)
There's a good tutorial [here](https://www.writebots.com/discord-bot-token/) (if the link is dead, google it).

### Hosting the bot on Heroku - NOTE: will have to remove dotenv usage to port over to Heroku
1. Fork this repo in Github (you'll need to create an account).
2. Create an account on [Heroku](https://herokuapp.com/) if you don't have one already
3. On your [Heroku Dashboard](https://dashboard.heroku.com/apps), create a new Heroku app
4. Connect your Heroku account to Github up the app to deploy from your forked repo.
5. In your app's Resources section, enable the worker dyno and disable the web dyno.
6. In your app's Settings, reveal config vars, then set DISCORD_TOKEN to your bot user token (see above
7. Restart all dynos using the 'More' menu. You're done!
