import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CommentsProvider } from '../../providers/comments/comments';
import { AuthProvider } from "../../providers/auth/auth";

import firebase from 'firebase';
import { ImageHandlerProvider } from "../../providers/image-handler/image-handler";

import { Content } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})

export class CommentsPage {
@ViewChild(Content) content: Content;
img;
comments:any =[];
comment;
user;

  constructor(public navCtrl: NavController, public navParams: NavParams, public commentsService: CommentsProvider,
           public authService: AuthProvider, public imgHandler: ImageHandlerProvider, private zone: NgZone) {
    this.img = navParams.get('image');
    this.comments = [];
    this.commentsService.getAndCompleteCommentsForImage(this.img).then((res) => {
      this.comments = res;
      // console.log('this.comments:'+JSON.stringify(this.comments));
    });
    this.authService.getUserData().on('value', snapshot => {
      this.user = snapshot.val();
    });
  }


  ionViewDidEnter() {
    this.scrollToBottom();
  }

  addComment() {
    if(this.comment != null && this.comment !== '') {
      this.commentsService.saveComment(this.img, this.comment, this.user).then((res) => {
        if(res) {
          this.commentsService.getAndCompleteCommentsForImage(this.img).then((res) => {
            this.comments = [];
            this.zone.run(() => {
              this.comments = res;
              this.scrollToBottom();
            }) 
          })
           this.comment = '';
        }
      })
    } else {
      alert('Please type comment');
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 300)
  }

}
