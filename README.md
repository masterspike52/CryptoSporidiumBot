CryptoSporidiumBot is a bod made in JS for the Destroy All Humans Re-Enlightened Discord server, i put it on github so anyone can use it for their server as well

HOW TO SETUP FOR OTHER SERVERS

STEP1: go to the <a href = "https://discord.com/developers/applications">Discord Developer Portal</a> and create a new application

STEP2: After creating the new bot go to the left side and click OAUTH2 and grab your bots Client ID token and in config.json replace the INSERTOAUTHCLIENTIDHERE with that ID you grabbed

STEP3: now click reset secret under the client secret and copy the code it gives you and in config.json replace INSERTBOTTOKENHERE with it

STEP4: now in discord go to settings >  Advanced and make sure developer mode is enabled (you need this because you have to grab the id's of things in discord) now when you right click stuff it should give you the option to copy the id of users and such

STEP5: right click your server and click copy server id and in config.json replace INSERTSERVERIDHERE with it

STEP6: back to the developer portal go back to the oauth2 section and scroll down to the OAuth2 URL Generator, then check the bot box when done you can give the bot permissions (i just give him admin perms because its easier)

STEP7: COPY THE GENERATED URL UNDERNEATH THE OPTIONS YOU SELECTED AND PASTE THE LINK IN YOUR BROWSER, THIS WILL LET YOU INVITE THE BOT TO YOUR SERVER 

STEP8: go to the bot section on the left of the developer portal and make sure the following selections are enabled 
-public bot
-Privileged Gateway Intents
-Presence Intent
-Server Members Intent
-Message Content Intent

STEP9: install <a href = https://nodejs.org/en/download>node.js</a> 

STEP10: once all the steps are done all you have to do is go into the folder, open a command window/powershell window, and type the following commands 
-node deploy.js
-node index.js

it should then say "Ready! Logged in as whatever your bots name is"

FUNCTIONS THE BOT HAS
-AutoModeration you can add words it bans in automod.js by replacing replace with words you want banned so if you want a set of words banned this is what itll look like 'banned word 1', 'banned word 2', 'banned word 3' and so on (you must put commas in between the words you want banned)
-Logging you can add a channel for logging by right clicking your logs channel and copying the channel id, itll also log to txt files in a log folder (it will create the log folder if it doesnt exist already)
-Mooderation commands these commands are for moderators only, and are located in the commands/utility folder (there are a couple you dont have to worry about such as a basic ping command and user command) to ensure only your mods can use them copy the id of your mods by right clicking their name > copy id and replace INSERTUSERIDHERE in the js files that have it with your mods id's
it should look like this 'mod id 1', 'mod id 2', 'mod id 3' and so on (just like the auto mod you must use commas, i also reccomend putting them beneath each other on their own lines for a more clean looking list)
-games
-fun little user interactions like rolling dice for dnd 
-point system the games allow your users to win points for winning 
