import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthProvider } from "../../providers/auth/auth";
import { Content } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  users:any =[];
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public authService: AuthProvider) {

  }

  ionSelected() {
    console.log('contacts page is selected');
  }

  ionViewWillEnter() {
    this.users=[];
     this.authService.getAllUsers().once('value', snap => {
       var data = snap.val();
        for(var key in snap.val()) {
          if(key === 'photoUrl') {
            this.users.push("data:image/jpeg;base64,"+data[key]);
          } else {
        this.users.push(data[key]);
          }
      }
     });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 300)
  }

  logout() {
    this.authService.logoutUser().then(() => {
      console.log('user logout');
      this.navCtrl.push('LoginPage');
    }).catch((err) => {
      console.log('err:'+err);
    })
  }

}
