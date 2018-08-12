import { Component, OnInit, ElementRef, ViewChild,TemplateRef} from '@angular/core';
import { Router } from '@angular/router';  
import { DataService } from '../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { ValidatorService } from "../services/validator.service"; 
import { Usuario } from "../models/usuario";
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import 'rxjs/add/observable/of';
import * as _ from "lodash";


@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css']
})
export class ReservaComponent implements OnInit {
	@ViewChild('confirmar') confirmar:ElementRef;
	@ViewChild('barber') barber:ElementRef;
	@ViewChild('date') date:ElementRef;

	public modalRef: BsModalRef;
 	public action: string = 'Login';

	public reservacion: any = {};

	public validLocal: boolean = false;
	public validBarber: boolean = false;
	public validReserva: boolean = false;
	public validReservaTotal: boolean = false;
	
	public barberiaUnica: boolean = true;
	public cargando: boolean = false;
	

	public selectedReserva: any = {};
	public usuarioParaCita: any = {};
	public oneAtATime: boolean = true;
	public provincias:any = [];
	public url:any;
	public escojeFecha:boolean = true;
	public cantones: any = [];
	public selectedProvincia:string = "San José";
	public selectedCanton:string = "Central";
	public selectedLocal:string = "";
	public buscaUsuario:string = "";
	public selectedLocalId: number = 0;

	public barberias: any = [];

	public pausas: any = [];
	public usuarioCita: any = [];

	public tiempoBarbero: number = 20;
	public horasBarbero: number = 13;
	public iniciaBarbero: string = '1000';

	public timeBoxes : any = [];
	public camposLibres : any = [];

	public reservas: any = [];

	public dateSelected:Date = new Date();
	public timeSelected:string= "1";

	public cantonesDisplay: any = [];

	public nuevoUsuario:Usuario = new Usuario();
	public usuarioErrores : any = [];
	public nuevoTelefono: number;
	public nuevoCorreo:string;
	public error:boolean = false;
	public validationError: boolean = false;
	public validationErrorMsg: string = '';
	public nuevoUsuarioDisplay: boolean = false;
	public nuevoUsuarioError: boolean = false;

	constructor(private modalService: BsModalService,private router:Router,public sanitizer: DomSanitizer, private dataService:DataService, public authService:AuthService, public validatorService:ValidatorService){

	}

	public openModal(template: TemplateRef<any>) {
	    this.modalRef = this.modalService.show(template);
	}

	ngOnInit() {
		this.cargando = true;
		this.reservacion.local={id : 0};
		var that = this;
		let time = (that.authService.loggedUser) ? 0 : 2000;
		setTimeout(function(){
	        if(that.authService.isAdminSucursalUser()){
	        	that.dataService.get('/sucursal/?idSucursal='+that.authService.loggedUser.idSucursal)
		            .then(response => {
		                that.barberias = response.sucursal;
		                if(that.barberias.length == 1){
		                	that.localSelectUnica(that.barberias[0].id);
		                }
		                that.cargando = false;
		            },
		            error => {
		            })
	        } else {
	        	that.provincias = ["San José","Alajuela","Cartago","Heredia","Guanacaste","Puntarenas","Limón"];
				that.dataService.get('/provinciaCanton')
		            .then(response => {
		                that.cantones = response.ProvinciaCanton;
		                that.cantonesDisplay = that.cantones[0].cantones;
		            },
		            error => {
		            });
		        if(that.authService.isAppUnica){
		        	that.dataService.get('/sucursal/?idBarberia='+that.authService.idBarberiaUnica)
			            .then(response => {
			                that.barberias = response.sucursal;
			                if(that.barberias.length > 0){
			                	that.localSelectUnica(that.barberias[0].id);
			                }
			                that.cargando = false;
			            },
			            error => {
			            })
		        } else {
			        that.dataService.get('/sucursal/?idCanton=1')
			            .then(response => {
			                that.barberias = response.sucursal;
			                if(that.barberias.length == 1){
			                	that.localSelectUnica(that.barberias[0].id);
			                }
			                that.cargando = false;
			            },
			            error => {
			            })
			    }
			}
			that.mapUrl();
		},time);
	}

	public updateHora(horario){
		horario.horaInicial = Number(horario.horaInicial.substring(0, 2) + horario.horaInicial.substring(3, 5));
		horario.horaFinal = Number(horario.horaFinal.substring(0, 2) + horario.horaFinal.substring(3, 5));
		return horario;
	}

	public modificaHoraToTime(hora){
		hora = hora + '';
		if(hora.length == 3){
			hora="0"+hora;
		}
		return hora;
	}

	public actualizaTimeBox(){
		var daysMap = ['DO','LU','MA','MI','JU','VI','SA'];
		if(this.reservacion.servicio && this.dateSelected){
			var timeBoxes = [];
			var horasBarbero = 0;
			var horarioInicio = this.updateHora(Object.assign({}, this.reservacion.barbero.horarios.find(o => o.dia == daysMap[this.dateSelected.getDay()]))).horaInicial;
			console.log('horarioInicio',horarioInicio);
			var today = new Date();
			console.log('time');
			console.log(today.getHours() >= Number(this.modificaHoraToTime(horarioInicio).substring(0, 2)));
			console.log(today.getMinutes() > Number(this.modificaHoraToTime(horarioInicio).substring(2, 4)));
			console.log(today.getHours() , Number(this.modificaHoraToTime(horarioInicio).substring(0, 2)));
			console.log(today.getMinutes() , Number(this.modificaHoraToTime(horarioInicio).substring(2, 4)));
			if(this.dateSelected.getFullYear()+this.dateSelected.getMonth()+this.dateSelected.getDate() == today.getFullYear()+today.getMonth()+today.getDate() && 
				(today.getHours() >= Number(this.modificaHoraToTime(horarioInicio).substring(0, 2)) && 
					today.getMinutes() > Number(this.modificaHoraToTime(horarioInicio).substring(2, 4)))){
				console.log('entra');
				var minutos = 0;
				while(minutos < today.getMinutes()){
					minutos += Number(this.reservacion.barbero.tiempoBarbero);
				}
				horarioInicio = today.getHours()*100 + minutos ;
				console.log('hora inicio nueva',horarioInicio);
			}
			var horarioFinal = this.updateHora(Object.assign({}, this.reservacion.barbero.horarios.find(o => o.dia == daysMap[this.dateSelected.getDay()]))).horaFinal;
			console.log('horarioFinal',horarioFinal);
			var hora = new Date();
			var horarioInicioFull = this.modificaHoraToTime(horarioInicio);
			console.log('horarioInicio', horarioInicio);
			console.log('horarioInicioFull', horarioInicioFull);
			if(horarioInicio){
				horasBarbero = (horarioFinal - horarioInicio) / 100;
				hora.setHours(Number(horarioInicioFull.substring(0, 2)));
				hora.setMinutes(Number(horarioInicioFull.substring(2, 4)));
				console.log('horasBarbero en if ',horasBarbero)
			}
			console.log('hora',hora);
			let timeBoxCount = (horasBarbero * 60 / this.reservacion.barbero.tiempoBarbero);
			console.log('timeBoxCount',timeBoxCount);
			for (var i = 0; i < timeBoxCount; i++) {
				var reservada = false;
				var pausada = false;
				for(var o = 0; o < this.reservas.length; o++) {
					var horaReservaInicial = new Date();
					var horaReservaFinal = new Date();
					horaReservaInicial.setHours(Number(this.reservas[o].horaInicial.substring(0, 2)));
					horaReservaInicial.setMinutes(Number(this.reservas[o].horaInicial.substring(2, 4)));
					horaReservaInicial.setSeconds(0);
					horaReservaFinal.setTime(horaReservaInicial.getTime());
					let duracion = (this.reservas[o].esDinamico == 1) ? this.reservas[o].duracionDinamica : this.reservas[o].duracion;
					console.log('duracion',duracion);
					horaReservaFinal.setMinutes(horaReservaFinal.getMinutes() + Number(duracion));
					horaReservaFinal.setSeconds(0);
					if (this.reservacion.fecha && horaReservaInicial.getTime() <= hora.getTime() && hora.getTime() <= horaReservaFinal.getTime() && (this.reservacion.fecha.getFullYear()+'-'+this.zerofill(this.reservacion.fecha.getMonth(),1)+'-'+this.zerofill(this.reservacion.fecha.getDate(),0) === this.reservas[o].dia)) {
						console.log('here',this.reservas[o].id,horaReservaInicial,hora,horaReservaFinal);
						reservada = true;
					}
				}
				for(var o = 0; o < this.pausas.length; o++) {
					var horaReservaInicial = new Date();
					var horaReservaFinal = new Date();
					horaReservaInicial.setHours(Number(this.pausas[o].horaInicial.substring(0, 2)));
					horaReservaInicial.setMinutes(Number(this.pausas[o].horaInicial.substring(2, 4)));
					horaReservaInicial.setSeconds(0);
					horaReservaFinal.setTime(horaReservaInicial.getTime());
					horaReservaFinal.setMinutes(horaReservaFinal.getMinutes() + Number(this.pausas[o].duracion));
					horaReservaFinal.setSeconds(0);
					if (horaReservaInicial.getTime() <= hora.getTime() && hora.getTime() <= horaReservaFinal.getTime()) {
						if(this.pausas[o].dia != '' && this.reservacion.fecha && this.pausas[o].dia.indexOf(daysMap[this.reservacion.fecha.getDay()]) != -1){
							pausada = true;
						}
						if(this.pausas[o].fecha && this.reservacion.fecha){
							var pausaDate = new Date(this.pausas[o].fecha);
							if(''+this.reservacion.fecha.getDate()+this.reservacion.fecha.getMonth()+this.reservacion.fecha.getFullYear() == ''+pausaDate.getDate()+pausaDate.getMonth()+pausaDate.getFullYear()){
								pausada = true;
							}
						}
					}
				}
				timeBoxes.push({
					'hora': new Date(hora.getTime()),
					'timeBoxCount': i,
					'reservada': reservada,
					'pausada': pausada
				});
				hora.setMinutes(hora.getMinutes() + Number(this.reservacion.barbero.tiempoBarbero));
			}

			var tiempo = this.reservacion.servicio.duracion;
			console.log('timeBoxes',timeBoxes);
			var ocupaCampos = tiempo / this.reservacion.barbero.tiempoBarbero;
			this.camposLibres = [];
			var estaReservada = false;
			var estaPausada = false;
			console.log('cam',ocupaCampos,timeBoxes.length);
			for (var i = 0; i < timeBoxes.length; i++) {
				estaReservada = false;
				estaPausada = false;
				for(var o = i; o < i+ocupaCampos; o++){
					if( o < timeBoxes.length){
						if(timeBoxes[o].reservada == true){
							estaReservada = true;
							break;
						}
						if(timeBoxes[o].pausada == true){
							estaPausada = true;
							break;
						}
					}
					else{
						console.log('aqui termina' ,o , timeBoxes);
						estaReservada = true;
						break;
					}
				}
				// if(!estaReservada){
					this.camposLibres.push({
						'hora':timeBoxes[i].hora,
						'reservada':estaReservada,
						'pausada':estaPausada
					})
				// }
			}
			console.log('campos after',this.camposLibres);
			if(this.camposLibres.length > 0){
				var existeTiempo = true;
				var horaFinalDate = new Date();
				var horarioFinalFull = this.modificaHoraToTime(horarioFinal);
				horaFinalDate.setHours(Number(horarioFinalFull.substring(0, 2)));
				horaFinalDate.setMinutes(Number(horarioFinalFull.substring(2, 4)));
				horaFinalDate.setSeconds(0,0);
				while(existeTiempo){
					var ultimaCaja = new Date(+this.camposLibres[this.camposLibres.length-1].hora);
					ultimaCaja.setMinutes(ultimaCaja.getMinutes() + Number(tiempo));
					ultimaCaja.setSeconds(0,0);
					if(ultimaCaja > horaFinalDate){
						this.camposLibres.pop();
					} else {
						existeTiempo = false;
					}
				}
			}
			console.log('campos',this.camposLibres);
		}
	}

	public zerofill(i,add) {
		i = i + add;
    	return ((i < 10 ? '0' : '') + i);
	}

	public provinciaChanged(value:any){
		this.cantonesDisplay = this.cantones[value].cantones;
		this.selectedProvincia = value;
		this.dataService.get('/sucursal/?idCanton='+this.cantonesDisplay[0].id)
            .then(response => {
                this.barberias = response.sucursal;
                if(this.barberias.length === 0) {
                	this.reservacion.local.id = 0;
                	this.selectedLocal = '';
                	this.selectedLocalId = 0;
                	this.validLocal = false;
                	this.isReservaValid();
					this.mapUrl();
                } else {
                	this.localSelectUnica(this.barberias[0].id);
                }
            },
            error => {
            })
	}

	public cantonChanged(value:any){
		this.selectedCanton = value;
		this.dataService.get('/sucursal/?idCanton='+this.selectedCanton)
            .then(response => {
                this.barberias = response.sucursal;
                if(this.barberias.length === 0) {
                	this.reservacion.local.id = 0;
                	this.selectedLocal = '';
                	this.selectedLocalId = 0;
                	this.validLocal = false;
                	this.isReservaValid();
                } else {
                	this.localSelectUnica(this.barberias[0].id);
                }
            },
            error => {
            })
		this.mapUrl();
	}

	public mapUrl(){
		this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed/v1/place?key=AIzaSyAU-zYJI8xdxE-rnEGAbzZwBBK_KHOOfnc&q='+this.selectedProvincia+ ' ' +this.selectedCanton + ' ' + this.selectedLocal );
	}

	public localSelect(value:any){
		this.reservacion.local = value.item;
		this.selectedLocalId = this.reservacion.local.id;
		this.validLocal = true;
		this.isReservaValid();
		this.mapUrl();
	}

	public localSelectUnica(id){
		var sucursal = this.barberias.find(b => b.id == id);
		this.reservacion.local = sucursal;
		this.validLocal = true;
		this.selectedLocal = this.reservacion.local.descripcion;
		this.selectedLocalId = this.reservacion.local.id;
		this.isReservaValid();
		this.mapUrl();
	}

	public dateSelectedChange(value:any){
		if(this.reservacion.barbero){
			this.cargando = true;
			this.dateSelected = new Date(value);
			this.reservacion.fecha = this.dateSelected;
			this.dataService.get('/reserva/?idUsuarioBarbero='+this.reservacion.barbero.id+'&&fecha='+this.reservacion.fecha.getFullYear()+'-'+this.zerofill(this.reservacion.fecha.getMonth(),1)+'-'+this.zerofill(this.reservacion.fecha.getDate(),0))
	        .then(response => {
	            console.log('success',response);
	            this.cargando = false;
	            this.reservas = this.updateTimeToHoraString(response.reserva);
				this.actualizaTimeBox();
				this.escojeFecha = false;
	        },
	        error => {
	        });
	    } else {
	    	alert('Por favor seleccione un barbero y un servicio primero.')
	    }
	}

	public selectReserva(reserva:any, ){
		this.selectedReserva = reserva;
		this.validReserva = true;
		this.reservacion.hora = reserva;
		this.goTo('confirmar');
		this.isReservaValid();
	}

	public toDate(value:string){
		var d = new Date();
		d.setHours(Number(value.substring(0, 2)));
		d.setMinutes(Number(value.substring(2, 4)));
		return d;
	}

	public goTo(value:string){
		if(value === 'date'){
			this.escojeFecha = true;
		}
		this[value].nativeElement.click()
	}

	public selectBarberDone(event){
		if(event.barber && event.servicio && event.changed)
		{
			this.goTo('date')
		}
		this.reservacion.barbero = event.barber;
		this.reservacion.servicio = event.servicio;
		this.validBarber = true;
		this.dataService.get('/pausaHorarioBarbero/?idUsuario='+this.reservacion.barbero.id)
	            .then(response => {
	                console.log('success',response);
	                this.pausas = this.updateTimeToHoraString(response.pausaHorarioBarbero);
	            },
	            error => {
	            });
	    if(this.reservacion.fecha){
			this.dataService.get('/reserva/?idUsuarioBarbero='+this.reservacion.barbero.id+'&&fecha='+this.reservacion.fecha.getFullYear()+'-'+this.zerofill(this.reservacion.fecha.getMonth(),1)+'-'+this.zerofill(this.reservacion.fecha.getDate(),0))
	            .then(response => {
	                console.log('success',response);
	                this.reservas = this.updateTimeToHoraString(response.reserva);
	            },
	            error => {
	            });
			this.actualizaTimeBox();
		}
		this.isReservaValid();
	}

	public updateTimeToHoraString(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
			pausas[i].horaInicial = pausas[i].horaInicial.substring(0, 2) + pausas[i].horaInicial.substring(3, 5);
		}
		return pausas;
	}

	public isReservaValid(){
		if(this.authService.isAdminSucursalUser()){
			if(this.reservacion.local && this.reservacion.barbero 
				&& this.reservacion.servicio && this.reservacion.fecha 
				&& this.reservacion.hora && this.reservacion.servicio && this.reservacion.usuarioCita){
				this.validReservaTotal = true;
			}
			else{
				this.validReservaTotal = false;
			}
		} else {
			if(this.reservacion.local && this.reservacion.barbero 
				&& this.reservacion.servicio && this.reservacion.fecha 
				&& this.reservacion.hora && this.reservacion.servicio 
				&& (!this.authService.loggedUser || this.authService.loggedUser.telefono.length > 0)){
				this.validReservaTotal = true;
			}
			else{
				this.validReservaTotal = false;
			}
		}
	}

	public confirmarReserva(modal){
		if(this.authService.isUserLogged()){
			this.cargando = true;
			let reserva : any = {};
			reserva.idSucursal = this.reservacion.local.id;
			if(this.authService.isAdminSucursalUser()){
				reserva.idUsuarioReserva = this.reservacion.usuarioCita.id;
			} else {
				reserva.idUsuarioReserva = this.authService.loggedUser.id;
			}
			reserva.idUsuarioBarbero = this.reservacion.barbero.id;
			reserva.idServicio = this.reservacion.servicio.id;
			if(this.reservacion.servicio.esDinamico){
				reserva.descripcion = this.reservacion.servicio.descripcion;
				reserva.precioDinamico = this.reservacion.servicio.precio;
				reserva.duracionDinamica = this.reservacion.servicio.duracion;
			}
			reserva.dia = this.reservacion.fecha;
			reserva.horaInicial = this.reservacion.hora.hora.getHours() + ":" + this.reservacion.hora.hora.getMinutes() + ":00";
			reserva.estado = 1;
			this.dataService.post('/reserva/', {"reserva":reserva})
	            .then(response => {
	                this.cargando = false;
					alert('Su reserva a sido confirmada!');
					this.router.navigate(['/home']);
	            },
	            error => {
	            });
	    } else {
	    	alert('Por favor ingrese al sistema para guardar su reserva');
	    	this.openModal(modal);
	    	this.authService.loggedObservable.subscribe(value => {
			    if(value && this.router.url === '/reserva'){
			    	if(this.authService.loggedUser.telefono.length > 0){
				    	this.cargando = true;
						let reserva : any = {};
						reserva.idSucursal = this.reservacion.local.id;
						reserva.idUsuarioReserva = this.authService.loggedUser.id;
						reserva.idUsuarioBarbero = this.reservacion.barbero.id;
						reserva.idServicio = this.reservacion.servicio.id;
						if(this.reservacion.servicio.esDinamico){
							reserva.descripcion = this.reservacion.servicio.descripcion;
							reserva.precioDinamico = this.reservacion.servicio.precio;
							reserva.duracionDinamica = this.reservacion.servicio.duracion;
						}
						reserva.dia = this.reservacion.fecha;
						reserva.horaInicial = this.reservacion.hora.hora.getHours() + ":" + this.reservacion.hora.hora.getMinutes() + ":00";
						reserva.estado = 1;
						this.dataService.post('/reserva/', {"reserva":reserva})
				            .then(response => {
				                this.cargando = false;
								alert('Su reserva a sido confirmada!');
								this.router.navigate(['/home']);
				            },
				            error => {
				        });
				    } else {
				    	this.isReservaValid();
				    }
			    }
			});
	    }
	}

	public hide(){
		this.modalRef.hide();
	}

	public buscaUsuarioChanged = _.debounce(function() {
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
		this.reservacion.usuarioCita = usuario;
		this.isReservaValid();
	}

	public updateAction(update){
		this.action = update;
	}

	public isNotNum(number){
		return isNaN(number);
	}

	public newUser(){
		this.nuevoUsuario.contrasenna = 'clave';
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario);
		if(this.usuarioErrores.length == 0){
			this.cargando = true;
			this.authService.nuevoUsuarioNoLogin(this.nuevoUsuario);
			let sub = this.authService.loggedObservable.subscribe(value => {
				this.cargando = false;
				this.usuarioCita = [];
			    if(value){
			    	this.nuevoUsuarioError = false;
			    	this.reservacion.usuarioCita = value;
			    	this.nuevoUsuarioDisplay = false;
			    	this.isReservaValid();
			    }
			    else{
			    	this.nuevoUsuarioError = true;
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

	public actualizarUsuario(){

	}

	public addTelefonoUpdate(){
		this.validationError = false;
		let nuevoTelefono : string = ''+this.nuevoTelefono;
		if(nuevoTelefono.length == 8){
			var tel = new Telefono();
			tel.telefono = this.nuevoTelefono +'';
			tel.idUsuario = this.authService.loggedUser.id;
			var that = this;
			this.dataService.post('/usuarioTelefono/', {"telefono":tel})
	            .then(response => {
	                that.authService.loggedUser.telefono.push(tel);
	                that.nuevoUsuario = that.authService.loggedUser;
	                that.authService.updateStoredUser();
					that.nuevoTelefono = null;
					this.isReservaValid();
	            },
	            error => {
	            });
		} else {
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del telefono"
		}
	}

	public removeTelefonoUpdate(telefono){
		var that = this;
		this.dataService.delete('/usuarioTelefono/'+telefono.id)
	            .then(response => {
	            },
	            error => {
	            });
	    that.authService.loggedUser.telefono = that.authService.loggedUser.telefono.filter(function(el) {
		    return el.telefono != telefono.telefono;
		});
		that.nuevoUsuario.telefono = that.nuevoUsuario.telefono.filter(function(el) {
		    return el.telefono != telefono.telefono;
		});
		that.authService.updateStoredUser();
	}


}


