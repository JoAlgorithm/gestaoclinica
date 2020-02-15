import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {AuthService} from './../../services/auth.service';
import { User } from '../../classes/user';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  desabilitar: boolean = false;
  texto: string = "Iniciar Sessão";

  public form: FormGroup;
  constructor(private fb: FormBuilder, private router: Router,
    private authService: AuthService, public snackBar: MatSnackBar) {}



  uname:string;
  password:string;


  users:User[];
  ngOnInit() {

    console.log("abriu aqui");
    this.authService.SignOut();
    localStorage.clear();

    this.authService.getAll().snapshotChanges().subscribe(data => {
      this.users = data.map(e => {
        return {
          uid: e.payload.key,
          ...e.payload.val(),
        } as User;
      }) 
      /*this.users.forEach(element => {
        console.log("Cidade "+element.cidade);
      });*/
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
    if(this.uname && this.password){
      
      this.texto = "AGUARDE...";
      this.desabilitar = true;

      this.authService.SignIn( this.uname , this.password)
      .then(r =>{
  
      }).catch(err => {
        this.texto = "Iniciar Sessão";
        this.desabilitar = false;
        console.log("component err: "+err.message);
        this.openSnackBar("Ocorreu um erro ao fazer login. Verifique o email e senha e tente novamente.");
      })
    }
    

    //this.router.navigate ( [ '/dashboard' ] );
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 3000
    })
  }

}
