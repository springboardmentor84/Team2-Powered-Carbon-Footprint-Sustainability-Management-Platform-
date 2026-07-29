import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {

  goToLogin() {
    console.log("Login Clicked");
  }

  goToSignup() {
    console.log("Signup Clicked");
  }

}