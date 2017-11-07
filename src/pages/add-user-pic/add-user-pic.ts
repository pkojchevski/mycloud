import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { ImageHandlerProvider } from "../../providers/image-handler/image-handler";
import { TabsPage } from "../tabs/tabs";
import { AuthProvider } from "../../providers/auth/auth";
// import { Camera, CameraOptions } from "@ionic-native/camera";


@IonicPage()
@Component({
  selector: 'page-add-user-pic',
  templateUrl: 'add-user-pic.html',
})


export class AddUserPicPage {
  moveon = true;
  imgUrl = 'https://firebasestorage.googleapis.com/v0/b/oil-chat.appspot.com/o/user.png?alt=media&token=9d84205e-d530-4815-b38a-e950417dce7d';
  img;
  file: File;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
  public imgHandler: ImageHandlerProvider, public zone: NgZone, public authService: AuthProvider,
  public loadingCtrl: LoadingController)
  {

  }

  ionViewDidLoad() {
  
  }

  chooseimage(event) {
   let loader = this.loadingCtrl.create();
   loader.present();
    this.file = event.target.files[0];
    this.moveon = false;
    this.imgHandler.addUserPicInStorage(this.file).then(url => {
      this.authService.addUserPicInDatabase(url).then(() => {
        this.navCtrl.push(TabsPage);
        loader.dismiss();
      }).catch(err => {
        alert('err:'+JSON.stringify(err));
        loader.dismiss();
      })
    }).catch(err=> {
      alert('err:'+JSON.stringify(err));
      loader.dismiss();
    })
  }

//   updateproceed() {
//       this.imgHandler.addUserPicInStorage(this.img).then((imgStr: any) => {
//         this.authService.uploadUserData(imgStr).then(()=> {
//           this.navCtrl.push(TabsPage);
//         }).catch(err => {
// //          console.log('err:'+err);
//         })   
//       }).catch(err => {
//  //       console.log('err:'+err);
//       })
//   }

  proceed() {
     this.navCtrl.push(TabsPage);
  }




}
