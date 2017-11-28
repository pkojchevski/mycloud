import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';

import { Tab, Platform, NavParams, Events } from 'ionic-angular'
import { MessagingProvider } from '../../providers/messaging/messaging';

// import { Badge } from '@ionic-native/badge';


// import { Firebase } from '@ionic-native/firebase';

@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;
  // notificationData = {data:{}};
  imagesCount = 0;
  usersCount = 0;
  commentsCount = 0;
  message;
  imageid;
  userid;

  constructor(private navParams: NavParams, public event: Events, private msgService: MessagingProvider) {
    this.msgService.getPermission();
    console.log('constructor tabs');
    event.subscribe('imagesIncr',(imagesid) => {
      console.log('subscribe');
        this.imagesCount++;
    })
    event.subscribe('commentsIncr', (imgcommentid) => {
      this.commentsCount++;
      console.log('subscribe on comments:'+this.commentsCount);
    })
  }
  
  tabSelected(tab: Tab) {
    if(tab.index === 1) {
      this.imagesCount = 0;
      this.commentsCount = 0;
      console.log('imagesCount reset:'+this.imagesCount);
      console.log('on reset commentsCount:'+this.commentsCount);
    } 
    if(tab.index === 2) {
      this.usersCount = 0;
    }
  }

  ionViewDidLoad() {
    console.log('ionviewdidload tabs');
   
  }

  ionViewWillEnter() {
  console.log('ionviewwillenter tabs');
  };

}
