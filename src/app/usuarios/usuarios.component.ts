import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  

import { AuthService } from '../services/auth.service';
import { ValidatorService } from "../services/validator.service"; 
import { Usuario } from "../models/usuario";
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';
import { DataService } from '../services/data.service';
import { SharedService } from '../services/shared.service';
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
	public fecha : Date = new Date();
	public error:boolean = false;
	public validationError: boolean = false;
	public validationErrorMsg: string = '';
	public nuevoUsuarioDisplay: boolean = false;
	public nuevoUsuarioError: boolean = false;
	public buscaUsuario:string = "";
	public usuarioCita: any = [];
	public encontroUsuario: boolean = false;
	public selectedDateNoFormat: string = '';
	public selectedProvincia : any = {};
	public selectedCanton : any = {};
	public provincias : any = [];
	public cantones : any = [];
	public distritos : any = [];
	public cantonesDisplay : any ;
	public posiblesClientes : any = [];

  constructor(private router:Router,private dataService:DataService, public authService:AuthService, public validatorService:ValidatorService, public sharedService:SharedService) { }

  ngOnInit() {
  		this.sharedService.get("/api/ubicacion").then((data) =>{
  			this.provincias = data.ubicacion;
  			this.selectedProvincia = this.provincias[0];
  			this.selectedCanton = this.selectedProvincia.cantones[0];
  			this.nuevoUsuario.distrito = this.selectedCanton.distritos[0].codigo;
  		});
  }




	public changeProvincia(event){
		this.selectedCanton = this.selectedProvincia.cantones[0];
  		this.nuevoUsuario.distrito = this.selectedCanton.distritos[0].codigo;
	}

	public changeCanton(event){
		this.nuevoUsuario.distrito = this.selectedCanton.distritos[0].codigo;
	}


  public newUser(){
		this.nuevoUsuario.contrasenna = 'clave';
		this.nuevoUsuario.fechaNacimiento = this.fecha;
		this.nuevoUsuario.idProvincia = this.selectedProvincia.codigo ;
		this.nuevoUsuario.idCanton = this.selectedCanton.codigo ;
		this.nuevoUsuario.barrio = '01';
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
		this.nuevoUsuario.fechaNacimiento = this.fecha;
		this.nuevoUsuario.idProvincia = this.selectedProvincia.codigo ;
		this.nuevoUsuario.idCanton = this.selectedCanton.codigo ;
	    this.nuevoUsuario.barrio = '01';
		if(this.usuarioErrores.length == 0){
			this.cargando = true;
			this.dataService.post('/usuario/?method=put', {'usuario':this.nuevoUsuario})
	            .then(response => {
	            	alert('Información actualizada');
	            	this.cargando = false;
	                this.nuevoUsuario = new Usuario();
	                this.encontroUsuario = false;
	                this.buscaUsuario = '';
	                this.fecha = new Date();
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
		this.selectedProvincia = this.provincias[Number(this.nuevoUsuario.idProvincia) - 1];
		this.selectedCanton = this.selectedProvincia.cantones[Number(this.nuevoUsuario.idCanton) - 1];
		this.encontroUsuario=true;
		this.usuarioCita = [];
		this.fecha= new Date(this.nuevoUsuario.fechaNacimiento);
		console.log(usuario);
	}

	public zerofill(i,add) {
		i = i + add;
    	return ((i < 10 ? '0' : '') + i);
	}

  	public fechaChanges(param){

  		var date = this.fecha.getFullYear()+'-'+this.zerofill(this.fecha.getMonth(),1)+'-'+this.zerofill(this.fecha.getDate() ,0);
  		if(date != param){
			this.fecha = new Date(param.replace(/-/g, '\/'));
		}
		
	}

	public deleteUser(){
		this.dataService.post('/usuario/?method=delete&idUsuario='+this.nuevoUsuario.id+'&idSucursal='+this.nuevoUsuario.idSucursal,{})
            .then(response => {
            	alert('Información Eliminada');
            	this.cargando = false;
                this.nuevoUsuario = new Usuario();
                this.encontroUsuario = false;
                this.buscaUsuario = '';
            },
            error => {
            	alert('Información Eliminada');
            	this.cargando = false;
            	this.cargando = false;
                this.nuevoUsuario = new Usuario();
                this.encontroUsuario = false;
                this.buscaUsuario = '';
        });
        
	}

	public buscarPorNombre(){
		this.posiblesClientes = [];
		this.cargando = true;
		this.sharedService.get('/api/personas?tipo=nombre&nombre='+this.nuevoUsuario.nombre+'&apellido1='+this.nuevoUsuario.apellido1+'&apellido2='+this.nuevoUsuario.apellido2).then(res =>{
			console.log(res);
			this.cargando = false;
			if(res.persona.length == 1){
				this.nuevoUsuario.cedula = res.persona[0].cedula;
				this.nuevoUsuario.nombre = this.toTitleCase(res.persona[0].nombre);
				this.nuevoUsuario.apellido1 = this.toTitleCase(res.persona[0].apellido1);
				this.nuevoUsuario.apellido2 = this.toTitleCase(res.persona[0].apellido2);
				//this.cliente.tipoId = '01';
				var cod = ''+res.persona[0].codigoelec;

				this.nuevoUsuario.idProvincia = Number(cod.substr(0,1));
				this.nuevoUsuario.idCanton = Number(cod.substr(1,2));
				this.selectedProvincia = this.provincias[Number(this.nuevoUsuario.idProvincia) - 1];
				this.selectedCanton = this.selectedProvincia.cantones[Number(this.nuevoUsuario.idCanton) - 1];
				this.nuevoUsuario.distrito = '' + Number(cod.substr(4,2));
			} else{
				this.posiblesClientes = res.persona;
			}
		}, err =>{
			console.log(err);
		})
	}

	toTitleCase(str) {
	    return str.replace(/\w\S*/g, function(txt){
	        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	}

	buscarPorCedula(){
		this.cargando = true;
		this.sharedService.get('/api/personas?tipo=cedula&filter='+this.nuevoUsuario.cedula).then(res =>{
			this.cargando = false;
			if(res.persona.length == 1){
				this.nuevoUsuario.cedula = res.persona[0].cedula;
				this.nuevoUsuario.nombre = this.toTitleCase(res.persona[0].nombre);
				this.nuevoUsuario.apellido1 = this.toTitleCase(res.persona[0].apellido1);
				this.nuevoUsuario.apellido2 = this.toTitleCase(res.persona[0].apellido2);
				//this.nuevoUsuario.tipoId = '01';
				var cod = ''+res.persona[0].codigoelec;

				this.nuevoUsuario.idProvincia = Number(cod.substr(0,1));
				this.nuevoUsuario.idCanton = Number(cod.substr(1,2));
				this.selectedProvincia = this.provincias[Number(this.nuevoUsuario.idProvincia) - 1];
				this.selectedCanton = this.selectedProvincia.cantones[Number(this.nuevoUsuario.idCanton) - 1];
				this.nuevoUsuario.distrito = '' + Number(cod.substr(4,2));
			}
		}, err =>{
			console.log(err);
		})
	}

	selectCliente(cli){
		this.nuevoUsuario.cedula = cli.cedula;
		//this.cliente.tipoId = '01';
		var cod = ''+cli.codigoelec;
		this.nuevoUsuario.idProvincia = Number(cod.substr(0,1));
		this.nuevoUsuario.idCanton = Number(cod.substr(1,2));
		this.nuevoUsuario.distrito = cod.substr(4,2);
	}

}
