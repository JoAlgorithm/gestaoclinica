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
  MatStepperModule
} from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import 'hammerjs';

import { PacienteRoutes } from './paciente.routing';

//import {AutocompleteDemoComponent} from './autocomplete/autocomplete-demo';
import {CadastroComponent} from './cadastro/cadastro.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { PacienteService } from '../services/paciente.service';
import { ListagemComponent, DiagnosticosDialog, CondutasDialog } from './listagem/listagem.component';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { PendentesComponent, FaturarDialog } from './pendentes/pendentes.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PacienteRoutes),
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
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    PacienteService,
    AngularFirestore,
    ConfiguracoesService
    
  ],
  declarations: [
    CadastroComponent,
    ListagemComponent,
    DiagnosticosDialog,
    PendentesComponent,
    FaturarDialog,
    CondutasDialog
  ],
  entryComponents: [
    DiagnosticosDialog,
    FaturarDialog,
    CondutasDialog
  ],
})

export class PacienteComponentsModule {}
