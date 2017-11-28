import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { ImageHandlerProvider } from '../providers/image-handler/image-handler';
// import { FileChooser } from "@ionic-native/file-chooser";
// import { File } from '@ionic-native/file';
// import { FilePath } from '@ionic-native/file-path';
// import { Camera } from '@ionic-native/camera';

// import { Geolocation } from '@ionic-native/geolocation';
// import { NativeGeocoder } from "@ionic-native/native-geocoder";

// import { GooglePlus } from '@ionic-native/google-plus';


import { config } from './app.firebaseconfig';

import firebase from 'firebase';

import { CommentsProvider } from '../providers/comments/comments';

import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFireOfflineModule } from 'angularfire2-offline';
import { AngularFireOfflineDatabase } from 'angularfire2-offline/database';

import { IonicImageViewerModule } from 'ionic-img-viewer';
import { UsernameValidator } from '../validators/username';
import { ProgressBarComponent } from '../components/progress-bar';
// import { Facebook } from '@ionic-native/facebook';
import { EditUserModalPage } from '../pages/edit-user-modal/edit-user-modal';
import { AngularFireAuth } from 'angularfire2/auth';
import { MessagingProvider } from '../providers/messaging/messaging';
// import { Network } from '@ionic-native/network';
//import { BrowserModule } from '@angular/platform-browser';
import { Ng2ImgToolsModule } from 'ng2-img-tools';

// class CameraMock extends Camera {
//   getPicture(options){
//     return new Promise( (resolve, reject) => {
//       resolve(`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`);
//     });
//   }
// }


@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    ProgressBarComponent,
    EditUserModalPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config),
    IonicImageViewerModule,
    AngularFireOfflineModule,
    Ng2ImgToolsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    EditUserModalPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    ImageHandlerProvider,
    AngularFireModule,
    AngularFireDatabaseModule,
    AngularFireDatabase,
    CommentsProvider,
    UsernameValidator,
    StatusBar,
    SplashScreen,
    AngularFireAuth,
    MessagingProvider
  ]
})
export class AppModule {}
