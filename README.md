# simplbottelegramjs

# Install:
Install the needed libraries:
```bash
npm install .
```
and you're ready to go!

# Usage:
Create a new bot using BotFather ( see /newbot part ):
https://core.telegram.org/bots

Then edit the config file ( BotTelegramConf.json )
Once you filled the Token field, you should fill the AcessList with the ids of your trusted users.
'Comandi' sections gives you the ability to run external programs for a given amount of time.
ping is just an example.
ngrokSSH it's another example that gives you the possibility to open an ssh tunnel for a given amount of time using ngrok,
but you have to install and configure it berofe ( see https://ngrok.com/ ) and fill the section accordingly.
To use it you should send a message like this ( open a tunnel for 5 minutes )
```bash
Esegui ngrokSSH 5
```
For all the others incoming chat from authorized users it behaves like an echo bot, but you're free to change it.

If you want simplbottelegramjs up and running at boot time you could use pm2:
https://pm2.keymetrics.io/

Those are the needed commands:
```bash
npm install pm2 -g   # it needs root privileges
pm2 start main.js
pm2 list
pm2 startup
pm2 save
```
