import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  

import { AuthService } from '../services/auth.service';
import { ValidatorService } from "../services/validator.service"; 
import { Usuario } from "../models/usuario";
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';
import { DataService } from '../services/data.service';
import * as _ from "lodash";

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

	public cargando: boolean = false;

	public nuevoUsuario:Usuario = new Usuario();
	public usuarioErrores : any = [];
	public nuevoTelefono: number;
	public nuevoCorreo:string;
	public error:boolean = false;
	public validationError: boolean = false;
	public validationErrorMsg: string = '';
	public nuevoUsuarioDisplay: boolean = false;
	public nuevoUsuarioError: boolean = false;
	public buscaUsuario:string = "";
	public usuarioCita: any = [];
	public encontroUsuario: boolean = false;

  constructor(private router:Router,private dataService:DataService, public authService:AuthService, public validatorService:ValidatorService) { }

  ngOnInit() {
  }

  public newUser(){
		this.nuevoUsuario.contrasenna = 'clave';
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario);
		if(this.usuarioErrores.length == 0){
			this.cargando = true;
			this.authService.nuevoUsuarioNoLogin(this.nuevoUsuario);
			let sub = this.authService.loggedObservable.subscribe(value => {
				this.cargando = false;
				if(this.router.url === '/clientes'){
				    if(value){
				    	this.nuevoUsuarioError = false;
				    	alert('Nuevo cliente guardado.');
				    	this.nuevoUsuario = new Usuario();
				    }
				    else{
				    	this.nuevoUsuarioError = true;
				    }
				}
				sub.unsubscribe();
			});
		}
	}

	public addTelefono(){
		this.validationError = false;
		let nuevoTelefono : string = ''+this.nuevoTelefono;
		if(nuevoTelefono.length == 8){
			var tel = new Telefono();
			tel.telefono = this.nuevoTelefono +'';
	  		if(!this.nuevoUsuario.telefono) this.nuevoUsuario.telefono = [];
			this.nuevoUsuario.telefono.push(tel);
			this.nuevoTelefono = null;
		}
		else{
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del telefono"
		}
	}

	public removeTelefono(telefono){
		this.nuevoUsuario.telefono = this.nuevoUsuario.telefono.filter(function(el) {
		    return el.telefono !== telefono.telefono;
		});
	}

	public addCorreo(){
		this.validationError = false;
		if(this.validatorService.emailValid(this.nuevoCorreo)){
			var cor = new Correo();
			cor.correo = this.nuevoCorreo +'';
	  		if(!this.nuevoUsuario.correo) this.nuevoUsuario.correo = [];
			this.nuevoUsuario.correo.push(cor);
			this.nuevoCorreo = null;
		}
		else{
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del correo"
		}
	}

	public removeCorreo(correo){
		this.nuevoUsuario.correo = this.nuevoUsuario.correo.filter(function(el) {
		    return el.correo !== correo.correo;
		});
	}

	public updateUser(){
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario, false);
		console.log(this.usuarioErrores);
		if(this.usuarioErrores.length == 0){
			this.dataService.post('/usuario/?method=put', {'usuario':this.nuevoUsuario})
	            .then(response => {
	            	alert('Información actualizada');
	            	this.cargando = false;
	                this.nuevoUsuario = new Usuario();
	                this.encontroUsuario = false;
	                this.buscaUsuario = '';
	            },
	            error => {
	            	this.cargando = false;
	        });
        }
	}

	public buscaUsuarioChanged = _.debounce(function() {
		this.encontroUsuario = false;
		this.nuevoUsuario =  new Usuario();
		if(this.buscaUsuario.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/usuario/?nombre='+this.buscaUsuario)
	        .then(response => {
	            console.log('success usuarios',response);
	            this.usuarioCita = response.usuario;
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaUsuario){
	    	this.usuarioCita = [];
	    }
	}, 400);

	public seleccionaUsuarioCita(usuario){
		this.nuevoUsuario = usuario;
		this.encontroUsuario=true;
		this.usuarioCita = [];
		console.log(usuario);
	}



}
