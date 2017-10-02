import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddUserPicPage } from './add-user-pic';

@NgModule({
  declarations: [
    AddUserPicPage,
  ],
  imports: [
    IonicPageModule.forChild(AddUserPicPage),
  ],
})
export class AddUserPicPageModule {}
