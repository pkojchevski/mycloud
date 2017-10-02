import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, NavParams, Events, LoadingController } from 'ionic-angular';
import { AuthProvider } from "../../providers/auth/auth";

import firebase from 'firebase';
import { ImageHandlerProvider } from "../../providers/image-handler/image-handler";
import { ImageViewerController } from "ionic-img-viewer";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage { 
  images:any = [];
  firestore = firebase.storage();
  newCommentId ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public authService: AuthProvider, 
        public alertCtrl: AlertController, public imgHandler: ImageHandlerProvider, 
        public loadingCtrl: LoadingController,
        public imageViewerCtrl: ImageViewerController, public event: Events, public zone: NgZone) {
          this.event.subscribe('new_comment', (data) => {
            //console.log('data:'+JSON.stringify(data));
            this.newCommentId = data.message;
            //console.log('picuid:'+this.newCommentId);
          })
  }



  ionSelected() {
    //console.log('about page is selected');
  }

logout() {
  this.authService.logoutUser().then(() => {
   // console.log('user logout');
    this.navCtrl.push('LoginPage');
  }).catch((err) => {
    //console.log('err:'+err);
  })
}

ionViewDidLoad() {
  
}




ionViewWillEnter() {
  this.images = [];
  let loader = this.loadingCtrl.create();
  loader.present();
  this.imgHandler.getAllImages().then((images) => {
  this.images = images;
  loader.dismiss();
 });

}

commentImg(image) {
  // console.log('image in commentImg:'+JSON.stringify(image));
  this.newCommentId = '';
  this.navCtrl.push('CommentsPage', {image:image});
}


onClick(imageToView) {
 // console.log('onClick()');
  const viewer = this.imageViewerCtrl.create(imageToView)
  viewer.present();
}




}
