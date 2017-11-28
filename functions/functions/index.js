const functions = require('firebase-functions');
var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
var wrotedata;
var comments;

// exports.PushTrigger = functions.database.ref('/images/{imageId}').onWrite((event) => {
//    wrotedata = event.data.val();
//    admin.database().ref('/FCMTokens').orderByChild('uid').once('value', (snap) => { 
//     var rawtokens  = snap.val();
//     var tokens = [];
//     processtokens(rawtokens).then((processedtokens) => {
//         //console.log('processedtokens:'+JSON.stringify(processedtokens));
//         for(var token of processedtokens) {
//             //   if(token.uid !== wrotedata.uid) {
//                 tokens.push(token.devtoken);
//             // }
//         }
//        if(tokens.length !== 0) {
//        var payload = {
//             'notification': {
//             'title': wrotedata.displayName,
//             "body": wrotedata.title,
//             "sound": "sound",
//             'click_action': 'action',
//             'icon': 'fcm_push_icon'
//             },
//                "data": {
//                   'sendername': 'images',
//                   'message': wrotedata.title
//                }
//             }
//             //console.log('tokens after:'+JSON.stringify(tokens));
//             return admin.messaging().sendToDevice(tokens, payload).then((res) => {
//                 console.log('notification pushed');
//             }).catch((err) => {
//                 console.log(err);
//             })
//         }
//         })
//    })
// })

exports.pushOnNewImage = functions.database.ref('/images/{imageId}').onCreate(event => {
    const image = event.data.val();
    const tokens = [];
    const userId = image.uid;
//   console.log('this.image:'+JSON.stringify(image));
//   console.log('userId:'+image.uid);
    const payload = {
       notification: {
        title: image.displayName,
        body: image.title,
        icon: "https://firebasestorage.googleapis.com/v0/b/oil-chat.appspot.com/o/mycloud_72px.png?alt=media&token=42685749-f3ca-46f9-9501-fdc87e2a3271"
       },
       data: {
           imageid:image.picuid
       }
    };
    
    admin.database()
           .ref(`fcmTokens/`)
            .once('value', snap => {
              console.log('snap.val():'+JSON.stringify(snap.val()));
              let alltokens = snap.val();
              for(let val in alltokens) {
                  console.log('val:'+val);
                 if(val !== userId) {
                    console.log('alltokens.val:'+alltokens[val]);
                    tokens.push(alltokens[val]);
                 }
              }
              return admin.messaging().sendToDevice(tokens, payload);
            })
            // .then(token => {
            //     console.log('token.val():'+JSON.stringify(token.val()));
            //     return token.val()})
            // .then(userFcmToken => {
            //     console.log('userFcmToken:'+JSON.stringify(userFcmToken));
            //     return admin.messaging().sendToDevice(userFcmToken, payload);
            // })
            .then(res => {
                console.log('notification send succesfully', res);
            })
            .catch(err => {
                console.log('err:', err);
            })
})

exports.pushOnNewComments = functions.database.ref('/comments/{commentId}').onCreate(event => {
    const comment = event.data.val();
    const userId = comment.useruid;
//   console.log('this.image:'+JSON.stringify(image));
//   console.log('userId:'+image.uid);
    const payload = {
       notification: {
        title: comment.displayName,
        body: comment.comment,
        icon: "https://firebasestorage.googleapis.com/v0/b/oil-chat.appspot.com/o/mycloud_72px.png?alt=media&token=42685749-f3ca-46f9-9501-fdc87e2a3271"
       },
       data: {
           imgcommentid:comment.picuid
       }
    };
    admin.database()
           .ref(`/fcmTokens/${userId}`)
           .once('value')
           .then(token => token.val())
           .then(userFcmToken => {
                console.log('userFcmToken:'+JSON.stringify(userFcmToken));
                return admin.messaging().sendToDevice(userFcmToken, payload);
            })
            .then(res => {
                console.log('notification send succesfully', res);
            })
            .catch(err => {
                console.log('err:', err);
            })
})

// exports.PushTriggerComments = functions.database.ref('/comments/{commentId}').onWrite((event) => {
//     comments = event.data.val();
//     console.log('comments:'+JSON.stringify(comments));
//     admin.database().ref('/FCMTokens').orderByChild('uid').once('value', (snap) => { 
//      var rawtokens  = snap.val();
//      var tokens = [];
//      processtokens(rawtokens).then((processedtokens) => {
//          for(var token of processedtokens) {
//             if(token.uid !== comments.useruid) {
//                  tokens.push(token.devtoken);
//              }
//          }
//         if(tokens.length !== 0) {
//         var payload = {
//              'notification': {
//              'title': comments.displayName,
//              "body": comments.comment,
//              "sound": "sound",
//              'click_action': 'action',
//              'icon': 'fcm_push_icon'
//              },
//                 "data": {
//                    'sendername': 'comments',
//                    'message': comments.picuid
//                 }
//              }
//              return admin.messaging().sendToDevice(tokens, payload).then((res) => {
//                  console.log('notification pushed');
//              }).catch((err) => {
//                  console.log(err);
//              })
//          }
//          })
//     })
//  })

// function processtokens(rawtokens) {
//     return new Promise((resolve, reject) => {
//         var processedtokens = [];
//       for (var token in rawtokens) {
//           processedtokens.push(rawtokens[token]);
//       }
//       resolve(processedtokens);
//     })
// }

// exports.createProfile = functions.auth.user().onCreate(event => {
//     console.log('event:'+JSON.stringify(event));
//     return admin.database().ref(`userProfile/${event.data.uid}`).set({
//         email:event.data.email
//     })
// });