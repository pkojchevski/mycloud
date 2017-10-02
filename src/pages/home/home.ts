import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController, Platform } from 'ionic-angular';
import { AuthProvider } from "../../providers/auth/auth";
import { ImageHandlerProvider } from "../../providers/image-handler/image-handler";

import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

import { EditUserModalPage } from "../edit-user-modal/edit-user-modal";

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ImageViewerController } from "ionic-img-viewer";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import firebase from 'firebase';

import { Firebase } from '@ionic-native/firebase';

import 'rxjs/add/operator/map'
import { Badge } from '@ionic-native/badge';


// declare var FCMPlugin: any;

export class NotificationModel {
  public body: string;
  public title: string;
  public tap: boolean
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {
  user: any;
  imgUrl;
  img;
  images = [];
  userProfile;
  numberOfPic;
  location = '';
  firetokens = firebase.database().ref('/pushtokens');
  firemsg = firebase.database().ref('/messages');
  notificationToken;

  constructor(public navCtrl: NavController, private authService: AuthProvider, 
              public imgHandler: ImageHandlerProvider, public zone:NgZone, public alertCtrl: AlertController,
              public loadingCtrl: LoadingController, public geolocation: Geolocation, public geocoder: NativeGeocoder,
              public modalCtrl: ModalController, public platform: Platform,  public imageViewerCtrl: ImageViewerController,
              public statusBar: StatusBar, public splashScreen: SplashScreen,
              public afd: AngularFireDatabase, public firebaseplugin: Firebase, public badge: Badge) {
    this.geolocate();
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.subscribeForNotifications();
    })
    console.log('currentUser:'+firebase.auth().currentUser);
  }



  subscribeForNotifications() {
    this.firebaseplugin.onTokenRefresh().subscribe((token) => {
        this.storeToken(token);
        console.log('refresh token');
    }, (error) => {
      console.log('err:'+error);
    });
  }

 storeToken(token) {
   this.firetokens.orderByChild('devtoken').equalTo(token).on('value', (snap) => {
     console.log('snap.val():'+JSON.stringify(snap.val()));
     if(snap.val() === null) {
      this.afd.list(this.firetokens).push({
        uid: firebase.auth().currentUser.uid,
        devtoken: token
      }).then(() => {
        console.log('token is saved');
      }).catch((err) => {
        console.log('token not stored');
      })
     }
   })
  
 }

 ionSelected() {
   console.log('home page is selected');
 }


  geolocate() {
    let options:{
       enableHighAccuracy: true
    }
    this.geolocation.getCurrentPosition(options).then((position: Geoposition) => {
       this.getCountry(position);
    }).catch(err => {
      alert('err in geolocation.getCurrentPosition:'+JSON.stringify(err));
    })
  }

  getCountry(position) {
   this.geocoder.reverseGeocode(position.coords.latitude, position.coords.longitude).
         then((res: NativeGeocoderReverseResult) => {
          this.location = res.countryName +', '+res.locality;
        });
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create();
    loading.present();
   this.authService.getUserData().on('value', snapshot => {
     this.user = snapshot.val();
   });
   this.imgHandler.getImagesOfCurrentUser().then((images:any) => {
    this.images = [];
     this.images = images;
     loading.dismiss();
   });
   
  }

  onClick(imageToView) {
    //console.log('onClick()');
    const viewer = this.imageViewerCtrl.create(imageToView);
    viewer.present();
  }

logout() {
  this.authService.logoutUser().then(() => {
    //console.log('user logout');
    this.navCtrl.push('LoginPage');
  }).catch((err) => {
    //console.log('err:'+err);
  })
}

addPic() {
   let loading = this.loadingCtrl.create();
   loading.present();
   this.imgHandler.getUserPic().then((img: any) => {
     this.zone.run(() => {
       this.imgUrl = "data:image/jpeg;base64,"+img;
       this.img = img;
     })
    })
    .then(()=> {
     this.imgHandler.addPicInStorage(this.img).then((obj) => {
      //  console.log('obj:'+JSON.stringify(obj));
       var comment;
        var alert = this.alertCtrl.create({
         buttons:[
           {
             text:'OK',
             role:'cancel',
             handler: data => {
               comment = data.comment;
               this.imgHandler.addPicUrlInDatabase(this.location, comment, obj['url'], this.user, obj['storageuid']).then(() => {
                    loading.dismiss().then(()=> {
                      this.imgHandler.getImagesOfCurrentUser().then((images:any) => {
                        this.images = [];
                         this.images = images;
                       })
                  })
              }).catch(err => {
                loading.dismiss().then(() => {
                    this.alertErr(err);
                }) 
              })
             }
           }
         ],
         inputs: [
           {
             name:'comment',
             placeholder:'Add comment'
           }
         ]
        })
        loading.dismiss().then(() => {
          alert.present();
        }) 
       }).catch(err => {
         this.alertErr(err);
       })
        })
}  

alertErr(err) {
  var alert = this.alertCtrl.create({
     message: err.message,
     buttons:[
       {
         text:"OK",
         role:'cancel'
       }
     ]
  })
  alert.present();
}


deleteImg(img) {
  this.imgHandler.deleteImageFromStorage(img).then(() => {
      this.imgHandler.deleteImageFromDatabase(img).then(()=> {
          var index = this.images.indexOf(img);
      //    console.log('index:'+index);
          this.images.splice(index, 1);
      })
      .catch((err)=> {
        //  console.log('err:'+JSON.stringify(err));
      })
  })
  .catch((err)=> {
     // console.log('err:'+JSON.stringify(err));
  })
  
}

openModal() {
   let editUserModal = this.modalCtrl.create(EditUserModalPage, {user:this.user});
   editUserModal.onDidDismiss((data) => {
     this.authService.checkDuplicateDisplayName(data).then(() => {
        this.authService.updateDisplayName(data);
     }).catch(err => {
        let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: err.message,
            buttons:[
              {
                text:'OK',
                role:'cancel'
              }
            ]
          })
          alert.present();
      }) 
      this.imgHandler.getImagesOfCurrentUser();
     })
   editUserModal.present();
}

commentImg(img) {
  this.navCtrl.push('CommentsPage', {image:img});
}




      
}
