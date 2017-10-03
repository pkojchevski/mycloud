import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import firebase from 'firebase';
import { Camera, CameraOptions } from "@ionic-native/camera";
import { AuthProvider } from "../auth/auth";
import { CommentsProvider } from "../comments/comments";

@Injectable()
export class ImageHandlerProvider {
  nativePath: any;
  firestore = firebase.storage();
  base64Image: string;
  nrOfPic: number;
  imagesRef = firebase.database().ref('/images');
  commentsRef = firebase.database().ref('/comments');

  options: CameraOptions = {
    quality:100,
    destinationType:this.camera.DestinationType.DATA_URL,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };

  constructor(public fileChooser: FileChooser, public camera: Camera, public authService: AuthProvider,
  public commentsService: CommentsProvider) {
    
  }

  getUserPic() {
    var promise = new Promise((resolve, reject) => {
      this.camera.getPicture(this.options).then(imageData => {
        //console.log('imageData:'+imageData);
        resolve(imageData);
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    })
    return promise;
  }

  addUserPicInStorage(imgStr) {
    // console.log('imgStr:'+imgStr);
    var promise = new Promise((resolve, reject) => {
      this.firestore.ref('/profileImages').child(firebase.auth().currentUser.uid).
       putString(imgStr, 'base64').then((snapshot) => {
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


addPicInStorage(imgStr) {
  var promise = new Promise((resolve, reject) => {
    let storageuid = firebase.auth().currentUser.uid + '_' + new Date().toISOString();
    this.firestore.ref('/images').child(storageuid)
    .putString(imgStr, 'base64')
    .then((snapshot) => {
       this.firestore.ref('/images').child(storageuid)
       .getDownloadURL().then(url => {
         resolve({'url':url, 'storageuid':storageuid});
       })
  //      .    .on("state_changed", (snapshot) => {
  //     console.log(snapshot); // progress of upload
  //  })
       .catch((err) => {
       console.log('err:'+JSON.stringify(err));
       });
    }).catch((err) => {
       console.log('err:'+JSON.stringify(err));
    });
  })
  return promise;
}

addPicUrlInDatabase(place, comment, imgUrl, user, storageuid) {
   var promise = new Promise((resolve, reject) => {
     //console.log('addPicUrlInDatabase');
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
      // .then(()=> {
      //   var img = { picuid:newImgKey};
      //    this.commentsService.saveComment(img, comment).then(() => {
      //      console.log('comment is saved');
      //    })
      // })
      .then(() => {
          this.incrNrOfPic().then(()=> {
            resolve(true);
          })
      })
      .catch((err) => {
        reject(err);
        //console.log('err:'+JSON.stringify(err));
      })
      })
   return promise;
}

getImagesFromUser() {
   return firebase.database().ref('images/');
}

getImageFromUid(picuid) {
  return new Promise((resolve, reject) => {
   this.imagesRef.orderByChild('picuid').equalTo(picuid).on('child_added', (snap) => {
      resolve(snap.val());
    })
  })

}

// getAllImages() {
//   return new Promise((resolve, reject) => {
//     let images = [];
//     this.imagesRef.on('value', (snap) => {
//     // console.log('getAllImages snap.val():'+JSON.stringify(snap.val()));
//           for(let key in snap.val()) {
//            //console.log('key:'+key);
//             firebase.database().ref('/images/'+key).on('value', (snapshot) => {
//               if(snapshot.val() == null) {
//                 images=[];
//                 resolve(images);
//               } else {
//                 let img = snapshot.val();
//                 this.authService.getUserFromUid(img.uid).then((user) => {
//                   //console.log('user:'+JSON.stringify(user));
//                    img.displayName = user['displayName'];
//                    img.key = key;
//                     images.push(img);
//                     resolve(images);
//                     //console.log('getAllImages:'+JSON.stringify(images));
//                 }).catch((err) => {
//                   alert('getAllImages about err:'+err);
//                   reject(err);
//                 })
//               }
//               });
//           }
//     })
//   })
// }
getAllImages() {
  return new Promise((resolve, reject) => {
    let images = [];
    this.imagesRef.once('value', (snap) => {
      for(var key in snap.val()) {
        images.push(snap.val()[key]);
      }
    }).then(() => {
      resolve(images);
    }).catch((err) => {
      reject(err);
    })
  })
}

getImagesOfCurrentUser() {
  return new Promise((resolve, reject) => {
    let images = [];
    this.imagesRef.orderByChild('uid').equalTo(firebase.auth().currentUser.uid).once('value', (snap) => {
        if(snap.val() == null) {
          images = [];
          resolve(images);
        } else {
          for(let key in snap.val()) {
            let img = snap.val()[key];
            img.key = key;
            images.push(img);
              resolve(images);
            }         
          }   
    }).catch(err => {
      reject(err);
    })
  })
}

deleteImageFromStorage(img) {
  //console.log('deleteimagefromstorage');
  var promise = new Promise((resolve, reject) => {
    this.firestore.ref().child('/images/'+img.storageuid).delete().then(() => {
    this.deleteImageFromDatabase(img);
    resolve(true);
  }).catch(err => {
    //console.log('err:'+JSON.stringify(err));
    reject(err);
  })
})
return promise;
}

deleteImageFromDatabase(img) {
  //console.log('deleteimagesfromdatabase');
 var promise = new Promise((resolve, reject) => {
    firebase.database().ref('images/').orderByChild('imgUrl').equalTo(img.imgUrl)
       .on('child_added', (snap) => {
       snap.ref.remove().then(() => {
        this.decrNrOfPic().then(() => {
        //  console.log('were here');
         resolve(true);
        })
        .catch((err) => {
          alert(err);
          reject(err);
        });
   }).catch((err) => {
     alert(err);
     reject(err);
   })
 })
})
 return promise;
}

getnrOfPic() {
  //console.log('getnrOfPic');
    var promise = new Promise((resolve, reject) => {
    firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).
      on('value', (snap) => {
        //console.log('snap in getnrOfPic:'+JSON.stringify(snap.val()));
        this.nrOfPic = snap.val().nrOfPic;
        resolve({'number':this.nrOfPic})
      })
  })
  return promise;
}

incrNrOfPic() {
 // console.log('incnrOfPic');
   return new Promise((resolve, reject) => {
    this.getnrOfPic().then((res) => {
      firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).update({
         nrOfPic : res['number'] + 1
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
    this.getnrOfPic().then((res) => {
       firebase.database().ref('/userProfile').child(firebase.auth().currentUser.uid).update({
         nrOfPic : res['number'] - 1
       })
       resolve(true);
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
