import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class CommentsProvider {

imagesRef = firebase.database().ref('/images');
commentsRef = firebase.database().ref('/comments');
usersRef = firebase.database().ref('/userProfile');

  constructor() {
  }

  saveComment(img, comment, user) {
  var d = new Date();
   return new Promise((resolve, reject) => {
    let newCommentKey = this.commentsRef.push().key;
    this.commentsRef.child(newCommentKey).set({
      useruid: firebase.auth().currentUser.uid,
      userPhoto: user.photoUrl,
      displayName: user.displayName,
      picuid:img.picuid,
      comment: comment,
      createdAt: ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
      d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)
    });
      resolve(true);
   })
  } 

  getAndCompleteCommentsForImage(img) {
    return new Promise((resolve, reject) => {
      let arr = [];
      let comment;
      let side = true;
       this.commentsRef.orderByChild('picuid').equalTo(img.picuid).on('child_added', (snap) => {
         comment = snap.val();
         comment['side'] = side;
         side = !side;         
          arr.push(comment);
          resolve(arr);
       })
       
    })
  }

  deleteComment(picuid) {
    return new Promise((resolve,reject) => {
      this.commentsRef.child('picuid').equalTo(picuid).on('child_added', (snap) => {
        snap.ref.remove().then()
    })
  })
}


}
