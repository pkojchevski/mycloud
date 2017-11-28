import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController, Platform, Events } from 'ionic-angular';
import { AuthProvider } from "../../providers/auth/auth";
import { ImageHandlerProvider } from "../../providers/image-handler/image-handler";

// import { Geolocation, Geoposition } from '@ionic-native/geolocation';
// import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

import { EditUserModalPage } from "../edit-user-modal/edit-user-modal";

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ImageViewerController } from "ionic-img-viewer";
// import { StatusBar } from "@ionic-native/status-bar";
// import { SplashScreen } from "@ionic-native/splash-screen";

import firebase from 'firebase';

// import { Firebase } from '@ionic-native/firebase';

import 'rxjs/add/operator/map'
// import { Badge } from '@ionic-native/badge';
import { CommentsProvider } from '../../providers/comments/comments';
import { MessagingProvider } from '../../providers/messaging/messaging';

import { AfoListObservable, AngularFireOfflineDatabase } from 'angularfire2-offline/database';
// import { AfoListObservable, AngularFireOfflineDatabase } from 'angularfire2-offline/database';

// import { Network } from '@ionic-native/network';
// import {googlemaps} from 'googlemaps'
//import { google } from 'google-maps';
import { Ng2ImgToolsService } from 'ng2-img-tools';

declare var google: any;

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
  images:AfoListObservable<any>;
  userProfile;
  numberOfPic;
  location = '';
  firetokens = firebase.database().ref('/pushtokens');
  firemsg = firebase.database().ref('/messages');
  notificationToken;
  storageProgress = 0;
  running = false;
  file: File;
  message;
  imageid;
  commentid;
  userid;
  imagesCount=0;
  commentsCount=0;
  usersCount=0;

  constructor(public navCtrl: NavController, private authService: AuthProvider, 
              public imgHandler: ImageHandlerProvider, public zone:NgZone, public alertCtrl: AlertController,
              public loadingCtrl: LoadingController, 
              public modalCtrl: ModalController, public platform: Platform,  public imageViewerCtrl: ImageViewerController,
              public afodb: AngularFireOfflineDatabase, 
              public msgService: MessagingProvider,
              public events: Events, public commentsProvider: CommentsProvider, 
              private ng2ImgToolsService: Ng2ImgToolsService) {
                this.getGeoLocation();
                this.msgService.receiveMessage();
  }

 ionSelected() {
   //console.log('home page is selected');
 }


 public getGeoLocation() {
  if (navigator.geolocation) {
      var options = {
        enableHighAccuracy: true
      };
      navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let long = position.coords.longitude;
        let geocoder = new google.maps.Geocoder();
        let latlng = new google.maps.LatLng(lat, long);
        let request = {
          latLng: latlng
        };   
          geocoder.geocode(request, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[0] != null) {
               this.location = results[0].address_components[results[0].address_components.length-4].short_name;                      
              } else {
                console.log('No address available');
              }
            }
          });

      }, error => {
        console.log(error);
      }, options);
  }
}



  ionViewDidLoad() {
    console.log('ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  let loading = this.loadingCtrl.create();
    loading.present();

   this.authService.getUserData().on('value', snapshot => {
     this.user = snapshot.val();
   });
  this.images = this.imgHandler.getImagesOfCurrentUser();
   loading.dismiss(); 
   

  }

  onClick(imageToView) {
    const viewer = this.imageViewerCtrl.create(imageToView);
    viewer.present();
  }

logout() {
  this.authService.logoutUser().then(() => {
    this.navCtrl.parent.parent.setRoot('LoginPage');
  }).catch((err) => {
    alert('err:'+JSON.stringify(err));
  })
}

choosePic(event) {
  return new Promise((resolve, reject) => {
    this.ng2ImgToolsService.resize(event.target.files[0], 800, 800)
    .subscribe(image => {
      this.file = image;
    }, error => {
      console.log('error:'+error);
    })
    console.log('file:'+this.file);
    if(typeof this.file !== 'undefined') {
      resolve();
    } else {
      reject();
    }
  })
}


addPic(event) {
    let loading = this.loadingCtrl.create();
    loading.present();
    this.choosePic(event).then(()=> {
      this.imgHandler.addPicInStorage(this.file).then((obj) => {
         var comment;
          var alert = this.alertCtrl.create({
           buttons:[
             {
               text:'OK',
               role:'cancel',
               handler: data => {
                 comment = data.comment;
                 this.imgHandler.addPicUrlInDatabase(this.location, comment, obj['url'], this.user, obj['storageuid'])
                 .then(() => {
                       loading.dismiss().then(()=> {
                        this.imgHandler.getImgFromUrl(obj['url']).then((img) => {
                          console.log('here');
                         this.ionViewDidLoad();
                          }).catch((err) => {
                            this.alertErr(err);
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
    }).catch(error => {
      this.alertErr(error);
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
  return this.images.remove(img).then(()=> {
    this.imgHandler.decrNrOfPic().then(()=> {
      this.commentsProvider.deleteComment(img).then();
    }).catch(err=> {
      alert('error:'+JSON.stringify(err));
    })
    }).catch(err => {
      alert('error:'+JSON.stringify(err));
    })
  // var index = this.images.indexOf(img);
  // this.images.splice(index, 1);
  // this.imgHandler.deleteImageFromStorage(img).then(() => {
  //   this.commentsProvider.deleteComment(img).then(() => {
  //   })
  // })
  // .catch((err)=> {
  //    alert(err);
  // })
  // console.log('img.picuid:'+img.picuid);
  // this.images.remove(img.picuid);
  
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
