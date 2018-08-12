import { Component, OnInit , Output, EventEmitter} from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service"; 
import { ValidatorService } from "../services/validator.service"; 
import { Usuario } from "../models/usuario";
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';

@Component({
  selector: 'login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

	public usuario:Usuario = new Usuario();
	public usuarioErrores : any = [];
	public nuevoTelefono: number;
	public nuevoCorreo:string;
	public error:boolean = false;
	public validationError: boolean = false;
	public validationErrorMsg: string = '';

	@Output() action : EventEmitter<any> = new EventEmitter();
	@Output() label : EventEmitter<any> = new EventEmitter();

	ngOnInit(){

	}

	constructor(public authService:AuthService,public validatorService:ValidatorService){
		this.authService.loggedObservable.subscribe(value => {
			console.log('execute');
		    if(value){
		    	this.error = false;
		    	this.action.emit();
		    }
		    else{
		    	this.error = true;
		    }
		});
	}

	loginWithFacebook(): void {
	    this.authService.fbLogin();
	}


	public logUser(){
		console.log('usuario',this.usuario);
		this.authService.login(this.usuario);
	}

	public newUser(){
		this.usuarioErrores = this.validatorService.validaUsuario(this.usuario);
		if(this.usuarioErrores.length == 0){
			this.authService.nuevoUsuario(this.usuario);
		}
	}

	public addTelefono(){
		console.log('nuevo',this.nuevoTelefono);
		this.validationError = false;
		let nuevoTelefono : string = ''+this.nuevoTelefono;
		if(nuevoTelefono.length == 8){
			var tel = new Telefono();
			tel.telefono = this.nuevoTelefono +'';
	  		if(!this.usuario.telefono) this.usuario.telefono = [];
			this.usuario.telefono.push(tel);
			this.nuevoTelefono = null;
		}
		else{
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del telefono"
		}
	}

	public removeTelefono(telefono){
		console.log('remove',telefono);
		this.usuario.telefono = this.usuario.telefono.filter(function(el) {
		    return el.telefono !== telefono.telefono;
		});
	}

	public addCorreo(){
		console.log('nuevo',this.nuevoCorreo);
		this.validationError = false;
		if(this.validatorService.emailValid(this.nuevoCorreo)){
			var cor = new Correo();
			cor.correo = this.nuevoCorreo +'';
	  		if(!this.usuario.correo) this.usuario.correo = [];
			this.usuario.correo.push(cor);
			this.nuevoCorreo = null;
		}
		else{
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del correo"
		}
	}

	public removeCorreo(correo){
		console.log('remove',correo);
		this.usuario.correo = this.usuario.correo.filter(function(el) {
		    return el.correo !== correo.correo;
		});
	}
}