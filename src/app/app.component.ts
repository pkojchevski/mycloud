import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import firebase from 'firebase';
import { AngularFireModule } from 'angularfire2';

import { config } from './app.firebaseconfig';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      console.log('here')
    });
    firebase.initializeApp(config);
    AngularFireModule.initializeApp(config)
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        //console.log('user:'+JSON.stringify(user));
         this.rootPage = TabsPage;
         unsubscribe();
       } else {
         this.rootPage = 'LoginPage';
         unsubscribe();
       }
    }) 

    
  }

}
