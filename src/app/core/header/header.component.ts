import { Component, EventEmitter, Output } from '@angular/core';

import * as screenfull from 'screenfull';

import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleNotificationSidenav = new EventEmitter<void>();

  //nomeClina:any;
  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    //this.nomeClina = this.authService.get_clinica_nome;
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
