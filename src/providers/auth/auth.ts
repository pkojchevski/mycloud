import {AfoListObservable, AngularFireOfflineDatabase} from 'angularfire2-offline';

import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
// import { GooglePlus } from '@ionic-native/google-plus';
// import { Facebook } from '@ionic-native/facebook';


@Injectable()
export class AuthProvider {
   userPic ='https://firebasestorage.googleapis.com/v0/b/oil-chat.appspot.com/o/user.png?alt=media&token=9d84205e-d530-4815-b38a-e950417dce7d';
   currentUser: any;
   userProfile: any;
   usersRef = firebase.database().ref('/userProfile');
   userFire: AfoListObservable<any[]>;

  constructor(public afAuth: AngularFireAuth, public afdb: AngularFireOfflineDatabase ) {
    firebase.auth().onAuthStateChanged((user) => {
       if(user) {
         this.currentUser = user;
         this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
         //console.log('user in auth constructor:'+JSON.stringify(this.userProfile));
       }
       //console.log('no user in auth constructor');
    })
    this.userFire = this.afdb.list('/usersProfile');
  }



loginWithGoogle() {
  return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
}

addNewUserFire(user) {
  return new Promise((resolve, reject) => {
    console.log('addNewUserFire');
    this.usersRef.orderByChild('email').equalTo(user.email).on('value', (snap) => {
  //console.log('snap:'+JSON.stringify(snap.val()));
    if(snap.val() !== null) {
      resolve();
      } else {
        firebase.database().ref('/userProfile').child(user.uid).set({
          email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoURL,
            nrOfPic:0
            }).then(() => {
              resolve(true);
            }).catch((err) => {
              alert('err:'+JSON.stringify(err));
              reject(err);
            })
  }
})
  })
}

loginWithFacebook1() {
  return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
}

addNewUser(mail, password, nickname) {
  var promise = new Promise((resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(mail, password).then((newUser) => { 
          let user = newUser;    
            this.checkDuplicateDisplayName(nickname).then(()=> {
              firebase.database().ref('/userProfile').child(user.uid).set({
                email: mail,
                displayName: nickname,
                photoUrl: this.userPic,
                nrOfPic:0
              });
              resolve();
            }).catch((err) => { 
              firebase.auth().currentUser.delete().then(() => {
                console.log('user is deleted');
                reject(err);
              }).catch(err => {
                reject(err);
              })
            });      
            }).catch(err => {
              reject(err);
            })
  })
  return promise;
}

loginEmailPassword(email, password) {
   return firebase.auth().signInWithEmailAndPassword(email, password);
}

logoutUser() {
  return firebase.auth().signOut();
}

getUserData() {
  //console.log('userProfile in GetUserData:'+JSON.stringify(this.userProfile)); 
  return this.userProfile;
}


getAllUsers() {
  // return firebase.database().ref('/userProfile').orderByChild('uid');
  return this.afdb.list('/userProfile');
}

addUserPicInDatabase(url) {
   var promise = new Promise((resolve, reject) => {
     this.userProfile.update({
       photoUrl: url
     }).then(() => {
        resolve({'success':true});
        //console.log('currentUser:'+JSON.stringify(firebase.auth().currentUser));
     }).catch((err) => {
       reject(err);
     })
   });
   return promise;
}

// googleLogin() {
//   var promise = new Promise((resolve, reject) => {
//     this.googleplus.login({
//       'webClientId':'566986544653-jjekvnfakr339ttmonbcbjgkhcgutnau.apps.googleusercontent.com',
//       'offline':true
//     })
//     .then((res) => {
//         firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
//           .then((response) => {
//             let res = response;
//             this.usersRef.orderByChild('email').equalTo(res.email).on('value', (snap) => {
//               //console.log('snap:'+JSON.stringify(snap.val()));
//               if(snap.val() !== null) {
//                 resolve(true);
//                 //console.log('email exists');
//               } else {
//                 firebase.database().ref('/userProfile').child(response.uid).set({
//                   email: response.email,
//                   displayName: response.displayName,
//                   photoUrl: response.photoURL,
//                   nrOfPic:0,
//                   username: this.reverseString(response.displayName)
//                 }).then(() => {
//                   resolve(true);
//                 })
//                  .catch(err => {
//                    //console.log('err:'+err);
//                    reject(err);
//               })
//               }   
//         })
//       })
//   }).
//           catch(err => {
//            reject(err);
//           })
// })      
//   return promise;
// }


// facebookLogin(): Promise<any> {
//   return new Promise((resolve, reject)=> {
//     this.facebook.login(['email']).then( response => {
//       const facebookCredential = firebase.auth.FacebookAuthProvider
//         .credential(response.authResponse.accessToken);
//         //console.log('facebookCredential:'+JSON.stringify(facebookCredential));
//       firebase.auth().signInWithCredential(facebookCredential)
//         .then(success => { 
//           this.usersRef.child(success.uid).once('value', (snap) => {
//               if(snap.val() !== null) {
//                 resolve(true); // user already exists
//               } else {  //first time login
//                 this.usersRef.child(success.uid).set({
//                   email: success.email,
//                   displayName: success.displayName,
//                   photoUrl: success.photoURL,
//                   nrOfPic:0,
//                   username: this.reverseString(success.displayName)
//                 }).then(() => {
//                   resolve(true);
//                 }).catch((err) => {
//                   alert('err:'+JSON.stringify(err));
//                   reject(err);
//                 }) 
//               }
//           }).catch((err) => {
//             alert('err:'+JSON.stringify(err));
//             reject(err);
//           })
//         }).catch((error) => {
//        //console.log(error);
//        reject(error);
//       });
//     }).catch((error) => {
//      // console.log(error);
//       reject(error);
//      });
//   })
// }

resetPassword(email: string) {
  return firebase.auth().sendPasswordResetEmail(email);
}


getUserByEmail(email) {
  var promise = new Promise((resolve, reject) => {
    firebase.database().ref('/userProfile').orderByChild('uid').once('value', (snap) => {
     var data = snap.val();
      for(var key in data) {
        if(key === 'email') {
          if(data[key] === email) {
            ////console.log('data[key]:'+data[key]);
            resolve({'success':true});
          }
      }
      }
    })
  })
  return promise;
}


updateDisplayName(name: string) {
   if(this.currentUser.displayName === name.trim()) {
     return;
   } else {
     return firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid)
     .update({
       displayName: name
     })
   }
}


checkDuplicateDisplayName(name) {
  //console.log('checkDuplicateDisplayName');
  return new Promise((resolve, reject) => {
    firebase.database().ref('/userProfile').orderByChild('displayName').equalTo(name)
      .once('value', (snap) => {
       // console.log('snap.val():'+JSON.stringify(snap.val()));
        if(snap.val() !== null) {
         // console.log('snap.val is not null');
          reject({message:"Username already exists"});
        } else {
          console.log('snap.val is nuull');
          resolve();
        }
      })
  })
}

getUsernameFromUid(name) {
  var promise = new Promise((resolve, reject) => {
   firebase.database().ref(`/userProfile`).orderByChild('username').equalTo(name).on('value', (snap)=> {
     //console.log('getUserDisplayNameFromUid:'+JSON.stringify(snap.val()));
     let displayName = snap.val()[firebase.auth().currentUser.uid].displayName;
     resolve(displayName);
   })
  })
  return promise;
}

getUserFromUid(uid) {
  var promise = new Promise((resolve, reject) => {
    firebase.database().ref(`/userProfile`).child(uid).on('value', (snap) => {
      resolve(snap.val());
    })
   })
   return promise;
 }


reverseString(str) {
    var splitString = str.split(""); 
    var reverseArray = splitString.reverse(); 
    var joinArray = reverseArray.join(""); 
  return joinArray;
}

setFcmKey(token) {
  console.log('setFcmKey');
   return this.afdb.list('/FCMTokens').push({
       fcm_token:token,
       uid:firebase.auth().currentUser.uid
          }) 
}

removeFcmToken() {
  return null;
//   console.log('removeFcmToken');
//   //  return this.afdb.list('/FCMtokens/'+firebase.auth().currentUser.uid).remove();
//   return new Promise((resolve, reject) => {
//     firebase.database().ref('/FCMTokens').orderByChild('uid').equalTo(firebase.auth().currentUser.uid)
//   .on('value', snap => {
//     console.log('snap:'+JSON.stringify(snap.val()));
//     if(snap !== null) {
//       snap.ref.remove();
//     resolve();
//     }
//   })
// })
}

}





