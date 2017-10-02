import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';

/**
 * Generated class for the ResetPasswordPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  resetPasswordForm: FormGroup;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public authService: AuthProvider,
    public fb: FormBuilder, public alertCtrl: AlertController) {
  
      this.resetPasswordForm = fb.group({
      email: ['', Validators.compose([Validators.required,
       EmailValidator.isValid])]
      });
    }
  
    ionViewDidLoad() {
      
    }
  
    resetPassword() {
      if(!this.resetPasswordForm.valid) {
      //console.log(this.resetPasswordForm.value);
      } else {
        this.authService.resetPassword(this.resetPasswordForm.value.email).
        then((user) => {
          let alert = this.alertCtrl.create({
            message:'We just sent You reset link to your email',
            buttons: [
              {
                text:'OK',
                role:'cancel',
                handler: () => {this.navCtrl.push('login');}
              }
            ]
          });
          alert.present();
        }, (error) => {
          var errorMessage: string = error.message;
          let errorAlert = this.alertCtrl.create({
            message: errorMessage,
            buttons:[{text:'OK', role:'cancel'}]
          });
          errorAlert.present;
        })
      }
    }
  
  }
