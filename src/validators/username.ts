import { Injectable } from "@angular/core";
import { AuthProvider } from "../providers/auth/auth";
import { FormControl } from "@angular/forms";


@Injectable()
export class UsernameValidator {

    debouncer: any;

    constructor(public authProvider: AuthProvider) {

    }

    checkUsername(control: FormControl) {
        // clearTimeout(this.debouncer);
    return new Promise((resolve, reject) => {
        this.debouncer = setTimeout(() => {
          this.authProvider.checkDuplicateDisplayName(control.value).then((res) => {
              if(res) {
                  resolve(null);
              } else {
                resolve({'usernameInUse': true});
              }    
          })
        }, 1000)
    })
    }

}