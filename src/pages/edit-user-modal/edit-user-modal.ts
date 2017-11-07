import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';



// @IonicPage()
@Component({
  selector: 'page-edit-user-modal',
  templateUrl: 'edit-user-modal.html',
})
export class EditUserModalPage {
  
  user: object = this.navParams.get('user');
  displayName:string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditUserModalPage');
  }

  closeModal() {
    this.viewCtrl.dismiss(this.displayName);
  }

  changeUserPic() {
   this.navCtrl.push('AddUserPicPage');
  }

  

}
