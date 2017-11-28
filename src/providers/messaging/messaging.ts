import { Injectable, Inject } from '@angular/core';

import firebase from 'firebase';
import { AuthProvider } from '../auth/auth';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Events } from 'ionic-angular';


@Injectable()
export class MessagingProvider {
  private messaging = firebase.messaging();
  currentMessage =  new BehaviorSubject(null);

  constructor(private authService: AuthProvider, 
              private afdb: AngularFireDatabase,
              private afAuth: AngularFireAuth, private events : Events) {
    
  }

  private updateToken(token) {
    this.afAuth.authState.take(1).subscribe(user => {
      if(!user) return;
      const data = {[user.uid]: token};
      this.afdb.object('fcmTokens/').update(data);
    })
  }

  getPermission() {
    this.messaging.requestPermission()
    .then(() => {
      console.log('Permission granted!');
      return this.messaging.getToken();
    })
    .then(token => {
      console.log('token:', token);
      this.updateToken(token);
    })
    .catch(err => {
      console.log('Unable to get token:', err);
    })
  }

  receiveMessage() {
      this.messaging.onMessage(payload => {
        console.log('Message received:'+JSON.stringify(payload));
        this.currentMessage.next(payload);
        if(payload['data'].imageid) {
          this.events.publish('imagesIncr', payload['data'].imageid);
        }
        if(payload['data'].imgcommentid) {
          console.log('publish comments');
          this.events.publish('commentsIncr', payload['data'].imgcommentid);
        }
        if(payload['data'].userid) {
          this.events.publish('usersIncr', payload['data'].userid);
        } 
     })
  }

}
