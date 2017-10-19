import { Input, Component } from "@angular/core";


@Component ({
    selector:'progress-bar',
    templateUrl:'progress-bar.html'
})

export class ProgressBarComponent {
   
 @Input('progress') progress;


  constructor() {

  }






}