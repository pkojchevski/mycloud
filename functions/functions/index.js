const functions = require('firebase-functions');
var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
var wrotedata;
var comments;

exports.PushTrigger = functions.database.ref('/images/{imageId}').onWrite((event) => {
   wrotedata = event.data.val();
   admin.database().ref('/pushtokens').orderByChild('uid').once('value', (snap) => { 
    var rawtokens  = snap.val();
    var tokens = [];
    processtokens(rawtokens).then((processedtokens) => {
        //console.log('processedtokens:'+JSON.stringify(processedtokens));
        for(var token of processedtokens) {
              if(token.uid !== wrotedata.uid) {
                tokens.push(token.devtoken);
            }
        }
       if(tokens.length !== 0) {
       var payload = {
            'notification': {
            'title': wrotedata.displayName,
            "body": wrotedata.title,
            "sound": "sound",
            'click_action': 'action',
            'icon': 'fcm_push_icon'
            },
               "data": {
                  'sendername': 'images',
                  'message': wrotedata.title
               }
            }
            //console.log('tokens after:'+JSON.stringify(tokens));
            return admin.messaging().sendToDevice(tokens, payload).then((res) => {
                console.log('notification pushed');
            }).catch((err) => {
                console.log(err);
            })
        }
        })
   })
})

exports.PushTriggerComments = functions.database.ref('/comments/{commentsId}').onWrite((event) => {
    comments = event.data.val();
    admin.database().ref('/pushtokens').orderByChild('uid').once('value', (snap) => { 
     var rawtokens  = snap.val();
     var tokens = [];
     processtokens(rawtokens).then((processedtokens) => {
         for(var token of processedtokens) {
            //    if(token.uid !== comments.uid) {
                 tokens.push(token.devtoken);
            //  }
         }
        if(tokens.length !== 0) {
        var payload = {
             'notification': {
             'title': comments.displayName,
             "body": comments.comment,
             "sound": "sound",
             'click_action': 'action',
             'icon': 'fcm_push_icon'
             },
                "data": {
                   'sendername': 'comments',
                   'message': comments.picuid
                }
             }
             return admin.messaging().sendToDevice(tokens, payload).then((res) => {
                 console.log('notification pushed');
             }).catch((err) => {
                 console.log(err);
             })
         }
         })
    })
 })

function processtokens(rawtokens) {
    return new Promise((resolve, reject) => {
        var processedtokens = [];
      for (var token in rawtokens) {
          processedtokens.push(rawtokens[token]);
      }
      resolve(processedtokens);
    })
}

// exports.createProfile = functions.auth.user().onCreate(event => {
//     console.log('event:'+JSON.stringify(event));
//     return admin.database().ref(`userProfile/${event.data.uid}`).set({
//         email:event.data.email
//     })
// });