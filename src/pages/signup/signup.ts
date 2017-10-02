import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormControl, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { EmailValidator } from "../../validators/email";
import { AuthProvider } from "../../providers/auth/auth";
import { TabsPage } from "../tabs/tabs";

import firebase from 'firebase';
import { UsernameValidator } from '../../validators/username';


@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})

export class SignupPage {
  signupForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder,
  public authService: AuthProvider, public loadingCtrl: LoadingController, public alertCtrl: AlertController, 
  public usernameValidator: UsernameValidator) {
    
    this.signupForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      nickname: ['', Validators.compose([Validators.required, Validators.minLength(3),
                 Validators.maxLength(30), Validators.pattern('[a-zA-Z]*')])] 
    })
  }

  signupUser() {
    let loader = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loader.present();
    this.authService.addNewUser(this.signupForm.value.email, this.signupForm.value.password, 
      this.signupForm.value.nickname).then(() => {
        loader.dismiss();
        this.navCtrl.push('AddUserPicPage');
      })
    .catch((err) => {
        console.log('error:'+err);
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
          loader.dismiss();
          alert.present();
      }) 
      
  }

  ionViewDidLoad() {

  }

}
