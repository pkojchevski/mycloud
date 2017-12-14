import { Injectable } from '@angular/core';
// import { File } from '@ionic-native/file';
// import { FileChooser } from '@ionic-native/file-chooser';
// import { FilePath } from '@ionic-native/file-path';
import firebase from 'firebase';
// import { Camera, CameraOptions } from "@ionic-native/camera";
import { AuthProvider } from "../auth/auth";
import { CommentsProvider } from "../comments/comments";
import { Events } from 'ionic-angular';
import { AngularFireOfflineDatabase, AfoListObservable } from 'angularfire2-offline/database';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import "rxjs/add/operator/map";

@Injectable()
export class ImageHandlerProvider {
  nativePath: any;
  firestore = firebase.storage();
  base64Image: string;
  nrOfPic: number;
  imagesRef = firebase.database().ref('/images');
  commentsRef = firebase.database().ref('/comments');
  imagesStorage = firebase.storage().ref('/images');
  currentUser;

  // options: CameraOptions = {
  //   quality:40,
  //   destinationType:this.camera.DestinationType.DATA_URL,
  //   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  // };

  constructor(public authService: AuthProvider,
              public commentsService: CommentsProvider, public events: Events, 
              public afodb: AngularFireOfflineDatabase, public afiredb: AngularFireDatabase,
              public afAuth: AngularFireAuth) {
     
    this.afAuth.authState.subscribe(res => {
      // console.log('res:'+JSON.stringify(res));
      this.currentUser = res;
    })
  }

  // getCurrentUserData() {
  //   return this.afdb.list('/users', {
  //       query: {
  //           orderBy:'uid',
  //           equalTo: this.currentUser
  //       }
  //     })
  //   }
  

  addUserPicInStorage(file) {
    // console.log('imgStr:'+imgStr);
    var promise = new Promise((resolve, reject) => {
      this.firestore.ref('/profileImages').child(firebase.auth().currentUser.uid).
       put(file).then((snapshot) => {
         this.firestore.ref('/profileImages').child(firebase.auth().currentUser.uid).getDownloadURL().then((url) => {
         resolve(url);
         }).catch(err => {
          reject(err);
        })
        }).catch(err => {
        reject(err);
      })
      })
    return promise;
  }

addPicInStorage(file) {
  return new Promise((resolve, reject) => {
    let storageuid = firebase.auth().currentUser.uid + '_' + new Date().toISOString();
    let uploadFile = this.firestore.ref('/images').child(storageuid).put(file);
    uploadFile
    // .on("state_changed", (snapshot) => {
    //   var bytes = Math.trunc(snapshot['bytesTransferred']/snapshot['totalBytes']*100);
    //   if(typeof bytes !== undefined && isFinite(bytes)) {
    //     this.events.publish('progressBar', {'progress':bytes});
    //   }
    //  }, 
    //  (err) => {
    //    aert(err);
    //  },
    //  ():any => {
    //     var url = storeImageAsString.snapshot.downloadURL;
    //     console.log('url:'+url);
    //     resolve({'url':url, 'storageuid':storageuid});
    //  }
    // )
    .then((snapshot) => {
       this.firestore.ref('/images').child(storageuid)
       .getDownloadURL().then(url => {
         resolve({'url':url, 'storageuid':storageuid});
       })
       .catch((err) => {
       console.log('err:'+JSON.stringify(err));
       });
    }).catch((err) => {
       console.log('err:'+JSON.stringify(err));
    });
  })
}

addPicUrlInDatabase(place, comment, imgUrl, user, storageuid) {
   var promise = new Promise((resolve, reject) => {
     let d = new Date();
     let newImgKey = firebase.database().ref('/images').push().key;
      firebase.database().ref('/images').
        child(newImgKey).set({
        uid: firebase.auth().currentUser.uid,
        createdAt: ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
        d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2),
        place: place,
        imgUrl: imgUrl,
        storageuid:storageuid,
        picuid: newImgKey,
        displayName:user.displayName,
        photoUrl: user.photoUrl,
        title: comment
      })
      .then(() => {
          this.incrNrOfPic().then(()=> {
            resolve(true);
          })
      })
      .catch((err) => {
        reject(err);
      })
      })
   return promise;
}



// getImagesFromUser(uid) {
//   //  return this.afoDatabase.list('/images', {
//   //    query: {
//   //      uid:uid
//   //    }
//   //  });


// }

getImgFromUrl(url) {
  return new Promise((resolve, reject) => {
   this.imagesRef.orderByChild('imgUrl').equalTo(url).once('child_added', (snap) => {
     resolve(snap.val());
   }).catch((err) => {
     reject(err);
   })
  })
}

getImageFromUid(picuid) {
  return new Promise((resolve, reject) => {
   this.imagesRef.orderByChild('picuid').equalTo(picuid).on('child_added', (snap) => {
      resolve(snap.val());
    })
  })

}

getAllImages() {
   return this.afodb.list('/images');
  }
  // return new Promise((resolve, reject) => {
  //   let images = [];
  //   this.imagesRef.once('value', (snap) => {
  //     for(var key in snap.val()) {
  //       images.push(snap.val()[key]);
  //     }
  //   }).then(() => {
  //     resolve(images);
  //   }).catch((err) => {
  //     reject(err);
  //   })
  // })
}

getImagesOfCurrentUser() {
   return this.afodb.list('/images', {
    query: {
      orderByChild: 'uid',
      equalTo: firebase.auth().currentUser.uid
    }
})
}

deleteImageFromStorage(img) {
  //console.log('deleteimagefromstorage');
  var promise = new Promise((resolve, reject) => {
    this.firestore.ref().child('/images/'+img.storageuid).delete().then(() => {
    this.deleteImageFromDatabase(img).then(() => {
      resolve(true);
    })
  }).catch(err => {
    //console.log('err:'+JSON.stringify(err));
    reject(err);
  })
})
return promise;
}

deleteImageFromDatabase(img) {
  //console.log('deleteimagesfromdatabase');
 return new Promise((resolve, reject) => {
   this.imagesRef.child(img.picuid).remove().
    // this.imagesRef.orderByChild('picuid').equalTo(img.picuid).on('value', (snap) => {
    //   if(snap !== null) {
    //     snap.ref.remove().
    then(() => {
          this.decrNrOfPic().then(() => {
            resolve(true);
        }).catch((err) => {
          alert(err);
          reject('err:'+JSON.stringify(err));
        })
      }).catch(err => {
        alert('err:'+JSON.stringify(err));
        reject(err);
      })
    })
      //  .once('value', (snap) => {
//          console.log('snap:'+JSON.stringify(snap.val()));
//           snap.ref.remove().then(() => {
//             this.decrNrOfPic().then(() => {
//             resolve(true);
//             })
//             .catch((err) => {
//               alert(err);
//               reject(err);
//             });
//         }).catch((err) => {
//           alert(err);
//           reject(err);
//         })
//  })

}

// getnrOfPic() {
//   console.log('getnrOfPic');
//     var promise = new Promise((resolve, reject) => {
//     firebase.database().ref(`/userProfile/${firebase.auth().currentUser.uid}`).
//       on('value', (snap) => {
//         console.log('user snap:'+JSON.stringify(snap));
//         this.nrOfPic = snap.val().nrOfPic;
//         resolve({'nrOfPic':this.nrOfPic})
//       })
//   })
//   return promise;
// }

incrNrOfPic() {
 // console.log('incnrOfPic');
   return new Promise((resolve, reject) => {
    // this.getnrOfPic().then((res) => {
      firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).once('value', (snap) => {
        let nrOfPic = snap.val().nrOfPic;
      firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).update({
         nrOfPic : nrOfPic + 1
       }).then(() => {
         resolve(true);
       }).catch(err => {
         alert(err);
         reject(err);
       })
   }).catch((err) => {
      //console.log('err:'+err);
      reject(err);
   }) 
   }) 
}

decrNrOfPic() {
  //console.log('decnrOfPic');
  return new Promise((resolve, reject) => {
    // this.getnrOfPic().then((res) => {
      firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).once('value', (snap)=> {
       //console.log('nrOfPic snap:'+JSON.stringify(snap.val()));
        let nrOfPic = snap.val().nrOfPic;
       firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).update({
         nrOfPic : nrOfPic - 1
       }).then(() => {
        resolve(true);
       })
       .catch((err) => {
         alert(err);
         reject(err);
       })
    }).catch((err) => {
    //   console.log('err:'+err);
       reject(err);
    })
  })
}

reverseString(str) {
  //console.log('str:'+str);
    // Step 1. Use the split() method to return a new array
    var splitString = str.split(""); // var splitString = "hello".split("");
    // ["h", "e", "l", "l", "o"]
 
    // Step 2. Use the reverse() method to reverse the new created array
    var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();
    // ["o", "l", "l", "e", "h"]
 
    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = reverseArray.join(""); // var joinArray = ["o", "l", "l", "e", "h"].join("");
    // "olleh"
    
    //Step 4. Return the reversed string
    return joinArray; // "olleh"
}



}
