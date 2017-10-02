import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';

import { Tab, Platform, NavParams, Events } from 'ionic-angular'

import { Badge } from '@ionic-native/badge';


import { Firebase } from '@ionic-native/firebase';

@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {

  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;
  notificationData = {data:{}};

  imagesCount = 0;
  usersCount = 0;

  constructor(private firebaseplugin: Firebase, private badge: Badge, private platform: Platform,
              private navParams: NavParams, public event: Events) {

  }
  
  tabSelected(tab: Tab) {
    if(tab.index === 1) {
      this.imagesCount = 0;
    } 
    if(tab.index === 2) {
      this.usersCount = 0;
    }
  }

ionViewDidLoad() {
  this.firebaseplugin.onNotificationOpen().subscribe((data) => {
    this.badge.increase(1);
})
}
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this.firebaseplugin.onNotificationOpen().subscribe((data) => {
      console.log('notification data:'+JSON.stringify(data));
      this.notificationData.data = data;
        if(data.tap) {
          console.log('data:'+JSON.stringify(data));
        }
          if(data.sendername === 'images') {
            this.imagesCount++;
          }
          if(data.sendername === 'comments') {
             this.imagesCount++;
             this.event.publish('new_comment', this.notificationData.data);
          }
          if(data.sendername === 'users') {
             this.usersCount++;
          }

      })


     
  }

}
