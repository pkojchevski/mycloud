import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditUserModalPage } from './edit-user-modal';

@NgModule({
  declarations: [
    EditUserModalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditUserModalPage),
  ],
})
export class EditUserModalPageModule {}
