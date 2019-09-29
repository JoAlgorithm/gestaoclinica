import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {AuthService} from './../../services/auth.service';
import { User } from '../../classes/user';

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


  users:User[];
  ngOnInit() {

    this.authService.getAll().snapshotChanges().subscribe(data => {
      this.users = data.map(e => {
        return {
          uid: e.payload.key,
          ...e.payload.val(),
        } as User;
      }) 
      this.users.forEach(element => {
        console.log("Cidade "+element.cidade);
      });
    })
    
    
    
    
    /*
    key: c.payload.key, ...c.payload.val()

    .subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as Paciente;
      })      
    })*/

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
