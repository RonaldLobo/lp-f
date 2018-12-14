import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';    
import { Usuario } from '../models/usuario'
import { Subject } from 'rxjs/Subject';
import { DataService } from './data.service';
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';
import { WindowRefService } from './window.service';
import { PushNotificationsService } from './push-notification.service';

import { FacebookService, InitParams, LoginResponse } from 'ngx-facebook';
var window : any;

@Injectable()
export class AuthService {
    private isLogged = false;
    private token:string = "token test";
    public loggedUser:Usuario;
    public errorDisplay: string = '';
    public logoEmpresa: string = '';
    public isImpersonando: boolean = false;
    public isAppUnica: boolean = false;
    public usuarioOriginal: any = {};
    public idBarberia:any = "";
    public idBarberiaUnica: number = 1;
    public logoAncho: number = 80;
    public nombreBarberia:string = "Los Peluqueros";
    public usuario:Usuario = new Usuario();
    public profilePic:string = '';
    public isApp = false;
    public fbUserIdApp = '';
    private _window:any;
    public provinciaSucursal: string = '';
    public cantonSucursal: string = '';
    public distritoSucursal: string = '';
    public barrioSucursal: string = '';
    public detalleDireccionSucursal: string = '';
    public tipoIdSucursal: string = '';
    public cedulaJuridicaSucursal: string = '';
    public idFacturaAPI : string = '';


    constructor(private router:Router,private dataService: DataService, private fb:FacebookService, private windowRef: WindowRefService, private pushNotificationsService:PushNotificationsService) {
        this.addAfter();
    }

    public addAfter(){
        var that = this;
        setTimeout(()=>{    
            let initParams: InitParams = {
              appId: '1466897480062572',
              xfbml: true,
              version: 'v2.10',
              status:true
            };

            that._window = that.windowRef.nativeWindow;
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if ( app ) {
                that.isApp = true;
            } else {
                that.fb.init(initParams);
            }
            that.getFromStore();
        },1500);
    }

    public loggedObservable = new Subject<boolean>();

    emitLogged() {
      this.loggedObservable.next(this.isLogged);
    }

    emitLoggedNoLogin(usuario) {
      this.loggedObservable.next(usuario);
    }



   
    public login(usuario:Usuario){
        this.dataService.post('/login/', {"usuario":usuario})
            .then(response => {
                console.log('success',response);
                this.isLogged = true;
                this.token = response.auth.token;
                this.loggedUser = response.auth.user;
                if(this.loggedUser.idSucursal == 1){
                    this.idBarberia = 1;
                    this.emitLogged();
                    this.storeUser();
                    this.pushNotificationsService.agregarTema('user'+this.loggedUser.id);
                } else {
                    this.dataService.get('/sucursal/'+this.loggedUser.idSucursal)
                    .then(response => {
                            this.idBarberia = response[0].idBarberia;
                            this.logoEmpresa = response[0].logo;
                            this.logoAncho = response[0].logoAncho;
                            this.provinciaSucursal = response[0].provincia;
                            this.cantonSucursal = response[0].canton;
                            this.distritoSucursal = response[0].distrito;
                            this.detalleDireccionSucursal = response[0].detalleDireccion;
                            this.tipoIdSucursal = response[0].tipoId;
                            this.cedulaJuridicaSucursal = response[0].cedulaJuridica;
                            this.barrioSucursal = response[0].barrio;
                            this.idFacturaAPI = response[0].idFacturaAPI;
                            this.emitLogged();
                            this.storeUser();
                            this.pushNotificationsService.agregarTema('user'+this.loggedUser.id);
                        },
                        error => {
                            this.isLogged = false;
                            this.emitLogged();
                        });
                }
            },
            error => {
                this.isLogged = false;
                this.emitLogged();
            });
    }

    public impersonar(usuario){
        this.usuarioOriginal = this.loggedUser;
        this.loggedUser = usuario;
        this.isImpersonando = true;
    }

    public noImpersonar(){
        this.isImpersonando = false;
        this.loggedUser = this.usuarioOriginal;
        this.router.navigate(['/home']);
    }

    public nuevoUsuario(usuario:Usuario){
        usuario.rol = 'U';
        usuario.idSucursal = 1;
        this.errorDisplay = '';
        this.dataService.post('/signup/', {"usuario":usuario})
            .then(response => {
                console.log('success',response);
                if(response.error){
                    this.isLogged = false;
                    this.errorDisplay = 'Por favor seleccione otro usuario.'
                    this.emitLogged();
                }
                else{
                    this.isLogged = true;
                    this.token = response.auth.token;
                    this.loggedUser = response.auth.user;
                    this.storeUser();
                    this.emitLogged();
                }
            },
            error => {
                console.log('error',error);
            });
    }

    public nuevoUsuarioNoLogin(usuario:Usuario){
        usuario.rol = 'U';
        usuario.idSucursal = 1;
        this.errorDisplay = '';
        this.dataService.post('/signup/', {"usuario":usuario})
            .then(response => {
                console.log('success',response);
                if(response.error){
                    this.errorDisplay = 'Por favor seleccione otro usuario.'
                    this.emitLoggedNoLogin(null);
                }
                else{
                    let newUser = response.auth.user;
                    this.emitLoggedNoLogin(newUser);
                }
            },
            error => {
                console.log('error',error);
            });
    }


    private storeUser(){
        this.dataService.setToken(this.token);
        try{
            localStorage.setItem('loggedUser', JSON.stringify({ token: this.token, user: this.loggedUser,idBarberia:this.idBarberia,fbUserIdApp:this.fbUserIdApp }));
        }
        catch(e){
            console.log(e);
        }
    }

    public updateStoredUser(){
        this.storeUser();
    }

    private getFromStore(){
        var loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
        if(loggedUser){
            console.log('logged');
            console.log(loggedUser);
            this.token = loggedUser.token;
            this.isLogged = true;
            this.loggedUser = loggedUser.user;
            this.idBarberia = loggedUser.idBarberia;
            this.fbUserIdApp = loggedUser.fbUserIdApp;
            this.dataService.setToken(this.token);
            if(this.fbUserIdApp){
                this.fbLogin();
            }
        }
    }

    public isUserLogged(){
        return this.isLogged;
    }

    public isRegularUser(){
        if(!this.loggedUser || !this.loggedUser.rol) return false;
        return this.loggedUser.rol.indexOf('U') != -1;
    }


    public isAdminUser(){
        if(!this.loggedUser || !this.loggedUser.rol) return false;
        return this.loggedUser.rol.indexOf('A') != -1;
    }

    public isAdminSucursalUser(){
        if(!this.loggedUser || !this.loggedUser.rol) return false;
        return this.loggedUser.rol.indexOf('S') != -1;
    }

    public isBarberoUser(){
        if(!this.loggedUser || !this.loggedUser.rol) return false;
        return this.loggedUser.rol.indexOf('B') != -1;
    }

    public logout(){
        this.pushNotificationsService.eliminarTema('user'+this.loggedUser.id);
        if(this.fbUserIdApp){
            this.logoutFb();
        }
        localStorage.removeItem('loggedUser')
        this.isLogged = false;
        this.loggedUser = null;
        this.isImpersonando = false;
        this.profilePic = '';
        this.fbUserIdApp = '';
        this.router.navigate(['/home']);
    }

    public getLoggedUser(){
        return this.loggedUser;
    }

    public getFbUser(){
        console.log('va a traer la info del usuario '+this.fbUserIdApp);
        this._window.facebookConnectPlugin.api("/me?fields=email,first_name,last_name,picture", null,(res)=>{
            console.log('Got the users profile');
            this.profilePic = res.picture.data.url;
            if(!this.isLogged){
                this.usuario.usuario = res.id;
                this.usuario.nombre = res.first_name;
                this.usuario.apellido1 = res.last_name.split(' ')[0];
                if(res.last_name.split(' ').length > 1){
                    this.usuario.apellido2 = res.last_name.split(' ')[1]
                }
                this.usuario.contrasenna = 'facebook';
                this.usuario.tipo = 'F';
                this.usuario.correo = [];
                if(res.email){
                    var cor = new Correo();
                    cor.correo = res.email;
                    this.usuario.correo.push(cor);
                }
                this.usuario.telefono = []
                if(res.phone){
                    var tel = new Telefono();
                    tel.telefono = res.phone;
                    this.usuario.telefono.push(tel);
                }
                this.usuario.idSucursal = 1;
                this.usuario.rol = 'U';
                this.login(this.usuario);
            }
        },(error)=>{
            console.log('error get user info ' + JSON.stringify(error));
        });
    }

    public fbLogin(){
        console.log('es un app '+this.isApp);
        if(this.isApp){
            console.log('antes del login status');
            this._window.facebookConnectPlugin.getLoginStatus((success)=>{
                console.log('despues del login status success');
                if(success.status === 'connected'){
                    console.log('despues si esta conectado ');
                    this.fbUserIdApp = success.authResponse.userID;
                    this.getFbUser();
                } else {
                    this._window.facebookConnectPlugin.login(['email','public_profile'],(response) => {
                            console.log('login dice que salio bien')
                            console.log('Hizo login' + JSON.stringify(response.authResponse));
                            this.fbUserIdApp = response.authResponse.userID;
                            this.getFbUser();
                        },(error)=>{
                            console.log('error get user info ' + JSON.stringify(error));
                        });
                }
            },(error)=> {
                console.log('error check status');
                console.log(error);
            });
        } else {
            this.fb.login({scope:'email,public_profile'})
              .then((response: LoginResponse) => {
                  console.log(response)
                  this.fb.api('/me?fields=email,first_name,last_name,picture')
                    .then((res: any) => {
                        console.log('Got the users profile', res);
                        this.profilePic = res.picture.data.url;
                        if(!this.isLogged){
                            this.usuario.usuario = res.id;
                            this.usuario.nombre = res.first_name;
                            this.usuario.apellido1 = res.last_name.split(' ')[0];
                            if(res.last_name.split(' ').length > 1){
                                this.usuario.apellido2 = res.last_name.split(' ')[1]
                            }
                            this.usuario.contrasenna = 'facebook';
                            this.usuario.tipo = 'F';
                            this.usuario.correo = [];
                            if(res.email){
                                var cor = new Correo();
                                cor.correo = res.email;
                                this.usuario.correo.push(cor);
                            }
                            this.usuario.telefono = []
                            if(res.phone){
                                var tel = new Telefono();
                                tel.telefono = res.phone;
                                this.usuario.telefono.push(tel);
                            }
                            this.usuario.idSucursal = 1;
                            this.usuario.rol = 'U';
                            console.log('user',this.usuario);
                            this.login(this.usuario);
                        }
                    })
                    .catch((error: any) => console.error(error));
              })
              .catch((error: any) => console.error(error));
          }
    }


    public logoutFb(){
        if(this.isApp){
            this._window.facebookConnectPlugin.logout((success) => {
                console.log('success logout');
            }, (failure) => {
                console.log('fail login');
            });
        } else {
            this.fb.logout()
            .then(function(response) {
               console.log('logout');
            });
        }
    }
    
}

