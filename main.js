const TelegramBot  = require('node-telegram-bot-api')                                                               ;
const http         = require('http')                                                                                ;
const util         = require('util')                                                                                ;
const ConfFromFile = require('./BotTelegramConf.json')                                                              ;
require('console-stamp')(console, 'yyyy-mm-dd  HH:MM:ss.l')                                                         ;
var   TimeProcess  = require("./MyLibs/TimeProcess.js")                                                             ;

var   liveData     = {}                                                                                             ;
const options      = { polling: true }                                                                              ;

const bot = new TelegramBot( ConfFromFile.Telegram.Token                                                           , 
	                     options 
                           )                                                                                        ; 
var getMe = bot.getMe()                                                                                             ;
getMe.then( function( result ) {
                                bot.sendMessage( ConfFromFile.Telegram.MainChat                                    ,
                                'Sono OnLine!')                                                                     ;
                                console.log( "connected" )                                                          ;
		               },function(err) {
                                console.log( err.toString() )                                                       ;
				console.log("Hai compilato il file di configurazione? sei collegato a internet?")   ;
				process.exit(1)                                                                     ;      
		               })                                                                                   ;

bot.on('message', (msg) => {
  const chatId = msg.chat.id                                                                                        ;
  console.log( "msg from " + msg.from.id + " Name:" + msg.from.first_name )                                         ;
  if ( typeof ( ConfFromFile.Telegram.AcessList.find(({ Id })=>Id === msg.from.id) ) == 'undefined' )
  {
    console.log( "NOT AUTHORIZED"                  )                                                                ; 
    console.log( " Dettagli full          :" , msg )                                                                ;
  }
  else
  {
    console.log( "utente autorizzato", msg )                                                                        ;
    var Words        = msg.text.split(/\s+/)                                                                        ;
    console.log( Words )                                                                                            ; 
    
    if ( Words[0] == 'aggiungi' ) { 
      var label      = Words[2]                                                                                     ;
      var cronString = Words.slice(3,8).join(" ")                                                                   ;
      var comment    = Words.slice(8).join(" ")                                                                     ;
    } else if ( Words[0] == 'Esegui' ) { 
      var processo   = Words[1]                                                                                     ;
      var minutes    = Words[2]                                                                                     ;
      if ( ConfFromFile.Comandi[processo] == undefined )
      {
        console.log( "processo non esiste", processo )                                                              ; 
      } else {
        console.log( "processo esiste!!!!", processo )                                                              ; 
        console.log( "liveData           ", liveData )                                                              ; 
        if ( liveData[processo] == undefined )
        {
          console.log( "processo nuovo" )                                                                           ;
          liveData[processo]         = {}                                                                           ;
          liveData[processo]['name'] = processo                                                                     ; 
          liveData[processo]['processRef'] = new TimeProcess( 
                                    { 
                                      "process"   : ConfFromFile.Comandi[processo]["comand"]                       ,
                                      "param"     : ConfFromFile.Comandi[processo]["args"]                         ,
                                      "liveData"  : liveData                                                       ,
                                      "label"     : processo                                                       ,
                                      "bot"       : bot                                                            ,
                                      "chatId"    : chatId                                                         , 
                                      "debug"     : true                 
                                    } 
                                   )                                                                                ;
          liveData[processo]['processRef'].StartProcess()                                                           ;
          liveData[processo]['processRef'].StartTimer( ( 
                                                        minutes                                                   ||
                                                        ConfFromFile.Comandi[processo]["comand"]["minutes"]
                                                       )
                                                      )                                                             ; 
          bot.sendMessage(chatId, 'Programma messo in esecuzione')                                                  ;
        } else {
          console.log( "processo esistente" )                                                                       ;
          liveData[processo]['processRef'].chatId  = chatId                                                         ;
          bot.sendMessage(chatId, 'Sottometto modifica durata del comando')                                         ;
          liveData[processo]['processRef'].ChangeTimer( 
                                                       (
                                                         minutes                                                  ||  
                                                         ConfFromFile.Comandi[processo]["comand"]["minutes"] 
                                                       )
                                                      )                                                             ; 
       }
       if ( ConfFromFile.Comandi[processo]["infoUrl"] ) { 
        setTimeout(() => {
        console.log('timeout beyond time')                                                                          ;
        url        = util.format( ConfFromFile.Comandi[processo]["infoUrl"] )                                       ;
        http.get( url, (response) => {
            let chunks_of_data = []                                                                                 ;
            response.on('data', (fragments) => {
              chunks_of_data.push(fragments)                                                                        ;
            });
           response.on('end', () => {
              let response_body   = Buffer.concat(chunks_of_data)                                                   ;
              JsonDict            = JSON.parse( response_body )                                                     ;
              DiscordReplyStr     = "\nLink di connessione :\n\n"                                                   ;
              DiscordReplyStr     = DiscordReplyStr + JsonDict.tunnels[0].public_url                               +                         
                                    "\nIl tunnel si chiude alle:\n"                                                +                         
                                    liveData[processo]['processRef'].stopTime                                      +                         
                                    "\n\n"                                                                          ;
              bot.sendMessage( chatId, DiscordReplyStr )                                                            ;
           })                                                                                                       ;

           response.on('error', (error) => {
              console.log(error)                                                                                    ;
              bot.sendMessage( chatId, 'KO...')                                                                     ;
           })                                                                                                       ;
        })                                                                                                          ;
       }, 3000)                                                                                                     ;
      }                                                 
      }
    } else if ( Words[0] == 'Riavvia' ) { 
       bot.sendMessage( chatId, 'OK ritorno subito!...')                                                            ;
       setTimeout(
                  process.exit                                                                                     , 
	          3000                                                                                             ,
	          0
	         )                                                                                                  ;
    } else {
      // DO YOUR STUFF HERE  
      bot.sendMessage( chatId                                                                                      , 
    	             ('Received your message :'+msg.text) )                                                         ;
    }
  }	  
})                                                                                                                  ;
