import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';

import {CdkTableModule} from '@angular/cdk/table';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {A11yModule} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {OverlayModule} from '@angular/cdk/overlay';
import {PlatformModule} from '@angular/cdk/platform';
import {ObserversModule} from '@angular/cdk/observers';
import {PortalModule} from '@angular/cdk/portal';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatTableModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,

} from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import 'hammerjs';

import { AngularFirestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { PacienteService } from '../services/paciente.service';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { EstoqueRoutes } from './estoque.routing';
import { MovimentosComponent, RegistoDialog, SaidaDialog } from './movimentos/movimentos.component';
import { CadastrosComponent, ConfirmacaoDialog } from './cadastros/cadastros.component';
import { EstoqueService } from '../services/estoque.service';
import { AuthService } from '../services/auth.service';
import { GestaoComponent } from './gestao/gestao.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EstoqueRoutes),
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTableModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatStepperModule,
    MatNativeDateModule,
    MatNativeDateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CdkTableModule,
    NgxPaginationModule ,
    //LayoutModule,
    //TableDemoModule,

    CdkTableModule,
    A11yModule,
    BidiModule,
    CdkAccordionModule,
    ObserversModule,
    OverlayModule,
    PlatformModule,
    PortalModule,
    NgxMatSelectSearchModule
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    PacienteService,
    AngularFirestore,
    ConfiguracoesService,
    EstoqueService,
    AuthService
  ],
  declarations: [
    MovimentosComponent,
    CadastrosComponent,
    RegistoDialog,
    ConfirmacaoDialog,
    SaidaDialog,
    GestaoComponent
  ],
  entryComponents: [
    RegistoDialog,
    ConfirmacaoDialog,
    SaidaDialog
  ],
})

export class EstoqueComponentsModule {}
