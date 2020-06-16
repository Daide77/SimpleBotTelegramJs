const util = require('util')
var   exec = require('child_process').spawn;

module.exports = function ( options ) {
  this.process   = options.process                                     ;
  this.param     = options.param                                       ; 
  this.liveData  = options.liveData	                               ;
  this.label     = options.label	                               ;
  this.bot       = options.bot   	                               ;
  this.chatId    = options.chatId	                               ;
  this.debug     = options.debug                                       ; 

  this.StartProcess = function( ){
     var  refChilP  = exec( this.process, this.param   )               ;
     var  debug     = this.debug                                       ;	  
     this.refChilP  = refChilP	                                       ;
     var GetTimeAsString = this.GetTimeAsString		               ; 
     refChilP.stdout.on('data', function( data ) { 
         if ( debug ){ 
           now          = Date.now()                                   ;
           console.log( "DEBUG PROCESS RUNNING: "                     + 
              GetTimeAsString( now ) )                                 ;
           console.log( data.toString() )                              ;
         }    	  
     });
     
     refChilP.stderr.on('data', function( data ) {
           console.log( "ProvaStErr" ) ;  
        	 if ( debug ){
            console.log('stderr : ' + data)                            ;
         }   
     });

     refChilP.on('close', function(code) {
        	 if ( debug ){
            console.log('closing code: ' + code)                       ;
         }   
     });
     return( refChilP.pid )                                            ;
  }

  this.GetTimeAsString = function(now){
    dt                 = new Date(now)                                 ;	
    return( ('0'+dt.getHours()).substr(-2)   + ":" +
            ('0'+dt.getMinutes()).substr(-2) + ":" + 
            ('0'+dt.getSeconds()).substr(-2) 
          )                                                            ;
  }	

  this.StopProcess = function(P,liveData,process,bot,chatId){ 
    console.log("Process killed for TimeOut pid " + P.pid)             ;	
    P.kill('SIGTERM')                                                  ;  
    try {
       delete liveData[process]                                        ; 
       bot.sendMessage( chatId,("Processo " + process + " arrestato")) ;
    } catch {
      console.log("canellazione fallita",liveData,process)             ;
    }	
  }

  this.ChangeTimer = function( minutes ){ 
    if ( this.timer ) {
        clearInterval(this.timer) ;                   	    
    } 
    this.stopTime = this.GetTimeAsString(now + (1000 * 60 * minutes))  ;	
    this.timer    = setTimeout( this.StopProcess                      , 
                                ( 1000 * 60 * minutes )               ,
                                this.refChilP                         ,
                                this.liveData                         , 
                                this.label                            , 
                                this.bot                              ,  
                                this.chatId   
                              )                                        ;
  }

  this.StartTimer  = function( minutes ){
     this.interval = minutes	                                       ;
     now           = Date.now()                                        ; 
     this.stopTime = this.GetTimeAsString(now + (1000 * 60 * minutes)) ;	
	  
     console.log( "INFO: Process " + this.process                     + 
	          " Pid "          + this.refChilP.pid                +
                  " STARTING AT "  + this.GetTimeAsString(now) 
                )                                                      ; 	  
     this.timer   = setTimeout( this.StopProcess                      , 
                                ( 1000 * 60 * minutes )               ,
                                this.refChilP                         ,
                                this.liveData                         , 
                                this.label                            ,
                                this.bot                              ,  
                                this.chatId   
                              )                                        ;
     // console.log( "DEBUG " + util.inspect( timer, false, null, true /* enable colors */) ); 
     return( this.refChilP.pid )                                              ;
  }
}
