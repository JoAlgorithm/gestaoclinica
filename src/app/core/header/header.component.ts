import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';

import * as screenfull from 'screenfull';

import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleNotificationSidenav = new EventEmitter<void>();

  nomeClina:any = "";
  constructor(private authService: AuthService) {
    /*while(this.nomeClina){
      this.nomeClina = this.authService.get_clinica_nome
    }*/
    //setTimeout(() => this.nomeClina = this.authService.get_clinica_nome);

    /*const user = JSON.parse(localStorage.getItem("myclinica_user"));
    console.log(user);
    this.nomeClina = user.clinica;*/
    this.nomeClina = this.authService.get_clinica_nome;
  }

  ngOnInit() {
    // setTimeout(() => this.nomeClina  =  this.authService.get_clinica_nome);
    
  }

  ngAfterViewInit(){
    
  }

  fullScreenToggle(): void {
    if (screenfull.enabled) {
      screenfull.toggle();
    }
  }

  logout(){
    this.authService.SignOut();
  }

  

}
