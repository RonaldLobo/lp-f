import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DecimalPipe } from '@angular/common'
import { DatePipe } from '@angular/common'
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';
import { LoginComponent } from './login/login.component';
import { CarouselComponent } from './home/carousel/carousel.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { SHARED_COMPONENTS } from './shared';
import { CalendarioInputComponent } from './calendario-input/calendario-input.component';

import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { FacturaService } from './services/factura.service';
import { SharedService } from './services/shared.service';
import { ValidatorService } from './services/validator.service';
import { FacebookLoginService } from './services/facebook-login.service';
import { PushNotificationsService } from './services/push-notification.service';

import { FacebookModule } from 'ngx-facebook';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ReservaComponent } from './reserva/reserva.component';
import { FormatHoraPipe } from './reserva/hora.pipe';
import { CalendarioComponent } from './calendario/calendario.component';
import 'hammerjs';

import { BarberosComponent } from './barberos/barberos.component';
import { UsuariosComponent } from './usuarios/usuarios.component';


import { CitasComponent } from './citas/citas.component';
import { FacturaComponent } from './factura/factura.component';

import { WindowRefService } from './services/window.service';
import { InventarioComponent } from './inventario/inventario.component';
import { FacturarComponent } from './facturar/facturar.component';

import {NgxPaginationModule} from 'ngx-pagination'; 


export const ROUTES: Routes = [
    { path: '',  redirectTo: 'home', pathMatch: 'full' },
    { 
        path: 'home',
        component: HomeComponent
    },
    { 
        path: 'reserva',
        component: ReservaComponent
    },
    { 
        path: 'configuracion',
        component: ConfiguracionComponent
    },
    { 
        path: 'info',
        component: InfoComponent
    },
    { 
        path: 'clientes',
        component: UsuariosComponent
    },
    { 
        path: 'citas',
        component: CitasComponent
    },
    { 
        path: 'factura',
        component: FacturaComponent
    },
     { 
        path: 'facturar',
        component: FacturarComponent
    },
    { 
        path: 'inventario',
        component: InventarioComponent
    },
    { 
        path: '**', 
        redirectTo: '/home'
    }
];


import { defineLocale } from 'ngx-bootstrap/bs-moment';
import { es } from 'ngx-bootstrap/locale';

defineLocale(es.abbr, es);


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    FooterComponent,
    CarouselComponent,
    LoginComponent,
    SHARED_COMPONENTS,
    ReservaComponent,
    CalendarioComponent,
    BarberosComponent,
    FormatHoraPipe,
    ConfiguracionComponent,
    InfoComponent,
    CalendarioInputComponent,
    UsuariosComponent,
    CitasComponent,
    FacturaComponent,
    InventarioComponent,
    FacturarComponent
  ],
  imports: [
    NgxPaginationModule,
    RouterModule.forRoot(
            ROUTES,
            { 
                preloadingStrategy: PreloadAllModules, 
                useHash: true
            }
        ),
    BrowserModule,
    FormsModule,
    HttpModule,
    CollapseModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    DatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    TypeaheadModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FacebookModule.forRoot()
  ],
  exports: [
    RouterModule
  ],
  providers: [
      // { provide: LOCALE_ID, useValue: "es-es" },
      WindowRefService,
      AuthService,
      DecimalPipe,
      DatePipe,
      FacturaService,
      DataService,
      ValidatorService,
      FacebookLoginService,
      PushNotificationsService,
      SharedService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
