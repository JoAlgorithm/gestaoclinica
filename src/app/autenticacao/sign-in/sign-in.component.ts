import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {AuthService} from './../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {


  public form: FormGroup;
  constructor(private fb: FormBuilder, private router: Router,
    private authService: AuthService) {}



  uname:string;
  password:string;

  ngOnInit() {
    this.form = this.fb.group ( {
      uname: [null , Validators.compose ( [ Validators.required ] )],
      password: [null , Validators.compose ( [ Validators.required ] )]
    });
  }

  onSubmit() {

    console.log("uname: " + this.uname)

    this.authService.SignIn( this.uname , this.password);

    //this.router.navigate ( [ '/dashboard' ] );
  }

}
