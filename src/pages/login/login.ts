import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { EmailValidator } from "../../validators/email";
import { TabsPage } from "../tabs/tabs";
import { AuthProvider } from "../../providers/auth/auth";
// import { GooglePlus } from '@ionic-native/google-plus';
import firebase from 'firebase';
// import { Facebook } from '@ionic-native/facebook'

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {
  loginForm: FormGroup
  loader;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder,
  public authService: AuthProvider, public alertCtrl: AlertController, public loaderCtrl: LoadingController) {
    this.loginForm = fb.group({
      email: ['', Validators.compose([Validators.required, 
             EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.required, 
                Validators.minLength(6)])]
    });
  }

  ionViewDidLoad() {

  }

  loginUser() {
    this.loader = this.loaderCtrl.create();
    this.loader.present();
    this.authService.loginEmailPassword(this.loginForm.value.email, this.loginForm.value.password).
    then((user) => {
      console.log('user in login:'+user);
      this.loader.dismiss().then(() => {
        this.navCtrl.push(TabsPage);
      })
    }).catch((err) => {
      this.loader.dismiss().then(()=> {
        let alert = this.alertCtrl.create({
        message: err.message,
        buttons: [
          {
            text:'OK',
            role:'cancel'
          }
        ]
      })
      alert.present();
      })
    })
  }

  goToSignup() {
    this.navCtrl.push('SignupPage');
  }

  goToResetPassword() {
     this.navCtrl.push('ResetPasswordPage');
  }

  loginWithGoogle() {
    let loader = this.loaderCtrl.create();
    loader.present();
    // console.log('goglelogin')
    this.authService.loginWithGoogle().then(data => {
      // console.log('data:'+JSON.stringify(data));
         this.authService.addNewUserFire(data.user).then(() => {
           this.navCtrl.setRoot(TabsPage);
           loader.dismiss();
         })
    }).catch(err => {
      alert('err:'+JSON.stringify(err));
      loader.dismiss();
    })
  }

  loginWithFacebook5() {
    this.authService.loginWithFacebook1()
    // .then(data => {
    //   console.log('data:'+JSON.stringify(data));
    //   this.authService.addNewUserFire(data.user).then(() => {
    //     this.navCtrl.setRoot(TabsPage);
    //   })
    // })
  }


}
