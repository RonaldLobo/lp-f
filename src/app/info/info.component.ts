import { Component, OnInit ,TemplateRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { WindowRefService } from '../services/window.service';
import { ValidatorService } from '../services/validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Usuario } from '../models/usuario';
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';

import { FacebookService, InitParams, LoginResponse } from 'ngx-facebook';




@Component({
	selector: 'user-info',
	templateUrl: './info.component.html',
	styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
	public modalRef: BsModalRef;
	public selectedDate : any = new Date();
	public selectedDateBarberia : any = new Date();
	public nuevoUsuario : Usuario;
	public agregaPausa: boolean = true;
	public pausaErrores: any = [];
	public usuarioErrores : any = [];
	public Object : any = Object;

	public displayCitas: boolean = false;
	public displayPausas : boolean = false;
	public displayContacto : boolean = false;
	public displayHorario : boolean = false;
	public displayResumen : boolean = false;
	public displayCitasBarberia : boolean = false;

	public nuevoTelefono: number;
	public nuevoCorreo: string;

	public horarios: any = [];

	public selectedHorarioLunes : any = {};
	public selectedHorarioMartes : any = {};
	public selectedHorarioMiercoles : any = {};
	public selectedHorarioJueves : any = {};
	public selectedHorarioViernes : any = {};
	public selectedHorarioSabado : any = {};
	public selectedHorarioDomingo : any = {};

	public reservas: any = [];
	public filteredReservas : any = [];

	public correosUsuarioDisplay :any = [];
	public telefonosUsuarioDisplay :any = [];
	public correosBarberoDisplay :any = [];
	public telefonosBarberoDisplay :any = [];

	public pausas: any = [];

	public opcionesDuracion: any = [];
	public tiempos: any = [];

	public selectedCita : any = this.reservas[0];
	public selectedPausa : any = {};

	public validationError: boolean = false;
	public validationErrorMsg: string = '';

	public cargando:boolean = false;

	public resumenFechaFinal: string = '';
	public resumenFechaInicial: string = '';
	public reservasResumen: any = [];
	public resumenGenerado: boolean = false;
	public cantidadCitas: number = 0;
	public ganancias : number = 0;

	public barberosCitasSucursal : any = [];
	public obteniendoBarberos: boolean = false;
	public cargandoCitas: boolean = false;

	public selectedBarbero: number;

	private _window:any;
	
	constructor(private fb:FacebookService,private modalService: BsModalService,public authService:AuthService, private validatorService:ValidatorService,private dataService:DataService, private windowRef: WindowRefService) {
		this.nuevoUsuario = Object.assign({}, this.authService.loggedUser);
		let initParams: InitParams = {
          appId: '1466897480062572',
          xfbml: true,
          version: 'v2.10',
          status:true
        };

        this._window = this.windowRef.nativeWindow;
        if ( !this.authService.isApp ) {
            this.fb.init(initParams);
        }
	}

	ngOnInit() {
		if(window.screen.width > 900){
			this.displayCitas = true;
			this.displayCitasBarberia = true;
			this.displayPausas = true;
			this.displayContacto = true;
			this.displayHorario = true;
			this.displayResumen = true;
		}
		var that = this;
		let time = (that.authService.loggedUser) ? 0 : 2000;
		setTimeout(function(){
			if(that.authService.isBarberoUser()){
				for (var i = 1; i < 9; i++) {
					that.opcionesDuracion.push(that.authService.loggedUser.tiempoBarbero * i);
				}
				var horaInicio = 700;
				var horaFinal = 2300;
				var hora = horaInicio;
				while(hora<=horaFinal){
					that.tiempos.push(hora);
					var estimado = hora + 60;
					if(estimado%100==0){
						hora = hora + 60;
					} else { 
						hora = hora + 20;
					}
				}

				that.horarios = that.authService.loggedUser.horarios;
				console.log(that.horarios.find(o => o.dia == 'LU'));
				that.selectedHorarioLunes = that.updateHora(that.horarios.find(o => o.dia == 'LU'));
				that.selectedHorarioMartes = that.updateHora(that.horarios.find(o => o.dia == 'MA'));
				that.selectedHorarioMiercoles = that.updateHora(that.horarios.find(o => o.dia == 'MI'));
				that.selectedHorarioJueves = that.updateHora(that.horarios.find(o => o.dia == 'JU'));
				that.selectedHorarioViernes = that.updateHora(that.horarios.find(o => o.dia == 'VI'));
				that.selectedHorarioSabado = that.updateHora(that.horarios.find(o => o.dia == 'SA'));
				that.selectedHorarioDomingo = that.updateHora(that.horarios.find(o => o.dia == 'DO'));
				that.dataService.get('/pausaHorarioBarbero/?idUsuario='+that.authService.loggedUser.id)
		            .then(response => {
		                that.pausas = that.updateTimeToHora(response.pausaHorarioBarbero);
		            },
		            error => {
		            });
		        that.cargandoCitas = true;
		        that.dataService.get('/reserva/?idUsuarioBarbero='+that.authService.loggedUser.id+'&fecha='+that.selectedDate.getFullYear()+'-'+that.zerofill(that.selectedDate.getMonth(),1)+'-'+that.zerofill(that.selectedDate.getDate(),0))
		            .then(response => {
		                that.reservas = that.updateTimeToHora(response.reserva);
		                that.cargandoCitas = false;
		            },
		            error => {
		            });
		        setInterval(function(){ 
		        	that.dataService.get('/reserva/?idUsuarioBarbero='+that.authService.loggedUser.id+'&fecha='+that.selectedDate.getFullYear()+'-'+that.zerofill(that.selectedDate.getMonth(),1)+'-'+that.zerofill(that.selectedDate.getDate(),0))
		            .then(response => {
		                that.reservas = that.updateTimeToHora(response.reserva);
		                that.cargandoCitas = false;
		            },
		            error => {
		            });
		        }, 30000);
			}
			if(!that.authService.isBarberoUser() && !that.authService.isAdminUser()){
				that.cargandoCitas = true;
				that.dataService.get('/reserva/?idUsuarioReserva='+that.authService.loggedUser.id)
		            .then(response => {
		                that.reservas = that.updateTimeToHora(response.reserva);
		                that.cargandoCitas = false;
		            },
		            error => {
		            });
		    }
		    if(that.authService.isAdminSucursalUser()){
		    	that.obtieneCitasBarberia(that);
		    	setInterval(function(){ 
		        	that.obtieneCitasBarberia(that);
		        }, 30000);
		    }

		},time);
	}

	public obtieneCitasBarberia(that){
		that.obteniendoBarberos = true;
		that.cargando = true;
		that.barberosCitasSucursal = [];
	    that.dataService.get('/usuario/?idSucursal='+that.authService.loggedUser.idSucursal)
            .then(response => {
            	that.obteniendoBarberos = false;
                let barberosSucursal = response.usuario;
                if(barberosSucursal.length != 0){
                	that.selectedBarbero = barberosSucursal[0].id;
                	var obtenerCitas = function(i){
                		let barberoCitas = { barbero: null, citas : []};
                		barberoCitas.barbero = barberosSucursal[i];
                		that.dataService.get('/reserva/?idUsuarioBarbero='+barberosSucursal[i].id+'&fecha='+that.selectedDateBarberia.getFullYear()+'-'+that.zerofill(that.selectedDateBarberia.getMonth(),1)+'-'+that.zerofill(that.selectedDateBarberia.getDate(),0))
				            .then(response => {
				                barberoCitas.citas = that.updateTimeToHora(response.reserva);
				        		that.barberosCitasSucursal.push(barberoCitas);
				        		if(i+1 < barberosSucursal.length){
				        			obtenerCitas(i+1);
				        		} else{
				        			that.obteniendoBarberos = false;
				        			that.cargando = false;
				        		}
				            },
				            error => {
				            });
                	}
                	obtenerCitas(0);
                }
            },
            error => {
            })
	}

	public changeBarbero(id){
		this.selectedBarbero = id;
	}

	public zerofill(i,add) {
		i = i + add;
    	return ((i < 10 ? '0' : '') + i);
	}

	public updateHora(horario){
		if(typeof(horario.horaInicial) == 'string'){
			horario.horaInicial = Number(horario.horaInicial.substring(0, 2) + horario.horaInicial.substring(3, 5));
		}
		if(typeof(horario.horaFinal) == 'string'){
			horario.horaFinal = Number(horario.horaFinal.substring(0, 2) + horario.horaFinal.substring(3, 5));
		}
		return horario;
	}

	public updateTimeToHora(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
			pausas[i].horaInicial = Number(pausas[i].horaInicial.substring(0, 2) + pausas[i].horaInicial.substring(3, 5));
		}
		return pausas;
	}

	public changeDate(option){
		if(option === "more"){
			let newDate = new Date(this.selectedDate.getTime());
			newDate.setDate(newDate.getDate() + 1);
			this.selectedDate = newDate;
		} else {
			let newDate = new Date(this.selectedDate.getTime());
			newDate.setDate(newDate.getDate() - 1);
			this.selectedDate = newDate;
		}
		var param = this.authService.isRegularUser() ? 'idUsuarioReserva' : 'idUsuarioBarbero';
		this.cargandoCitas = true;
		this.dataService.get('/reserva/?'+param+'='+this.authService.loggedUser.id+'&fecha='+this.selectedDate.getFullYear()+'-'+this.zerofill(this.selectedDate.getMonth(),1)+'-'+this.zerofill(this.selectedDate.getDate(),0))
	            .then(response => {
	                this.reservas = this.updateTimeToHora(response.reserva);
	                this.cargandoCitas = false;
	            },
	            error => {
	            });
	}

	public changeDateBarberia(option){
		if(option === "more"){
			let newDate = new Date(this.selectedDateBarberia.getTime());
			newDate.setDate(newDate.getDate() + 1);
			this.selectedDateBarberia = newDate;
		} else {
			let newDate = new Date(this.selectedDateBarberia.getTime());
			newDate.setDate(newDate.getDate() - 1);
			this.selectedDateBarberia = newDate;
		}
		this.obtieneCitasBarberia(this);
	}

	public openModal(template: TemplateRef<any>) {
		this.modalRef = this.modalService.show(template);
	}

	public update(){
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario);
		if(this.usuarioErrores.length == 0){
			var that = this;
			this.cargando = true;
			this.updateUser();
		}
	}

	public updateUser(){
		this.dataService.post('/usuario/?method=put', {"usuario":this.nuevoUsuario})
            .then(response => {
            	alert('Información actualizada');
            	this.cargando = false;
                this.authService.loggedUser = response.usuario;
            },
            error => {
            	this.cargando = false;
            });
	}

	public updateFacebook(){
		this.cargando = true;
		this.fbLoginVincular();
	}

	public getFbUserVincular(){
        this._window.facebookConnectPlugin.api(this.authService.fbUserIdApp+"/?fields=email,first_name,last_name,picture", ["user_birthday"],(res)=>{
            console.log('Got the users profile', res);
            this.authService.profilePic = res.picture.data.url;
            this.nuevoUsuario.usuario = res.id;
            this.nuevoUsuario.nombre = res.first_name;
            this.nuevoUsuario.apellido1 = res.last_name.split(' ')[0];
            if(res.last_name.split(' ').length > 1){
                this.nuevoUsuario.apellido2 = res.last_name.split(' ')[1]
            }
            this.nuevoUsuario.contrasenna = 'facebook';
            this.nuevoUsuario.tipo = 'F';
            this.updateUser();
        },(error)=>{
            console.log('error get user info ' + JSON.stringify(error));
            this.cargando = false;
        })
    }

    public fbLoginVincular(){
        if(this.authService.isApp){
            this._window.facebookConnectPlugin.login(['email','public_profile'],(response) => {
                    this.authService.fbUserIdApp = response.authResponse.userID;
                    this.getFbUserVincular();
                },(error)=>{
                    console.log('error get user info ' + JSON.stringify(error));
                    this.cargando = false;
                });
        } else {
            this.fb.login({scope:'email,public_profile'})
              .then((response: LoginResponse) => {
                  console.log(response)
                  this.fb.api('/me?fields=email,first_name,last_name,picture')
                    .then((res: any) => {
                        console.log('Got the users profile', res);
                        this.authService.profilePic = res.picture.data.url;
			            this.nuevoUsuario.usuario = res.id;
			            this.nuevoUsuario.nombre = res.first_name;
			            this.nuevoUsuario.apellido1 = res.last_name.split(' ')[0];
			            if(res.last_name.split(' ').length > 1){
			                this.nuevoUsuario.apellido2 = res.last_name.split(' ')[1]
			            }
			            this.nuevoUsuario.contrasenna = 'facebook';
			            this.nuevoUsuario.tipo = 'F';
			            this.updateUser();
                    })
                    .catch((error: any) => console.error(error));
              })
              .catch((error: any) => console.error(error));
          }
    }

	public mayorQueHoy(date){
		var dateCita = new Date(date);
		var hoy = new Date(); 
		return (dateCita > hoy)
	}

	public igualQueHoy(date){
		var dateCita = new Date(date);
		dateCita.setMinutes(0,0,0);
		var hoy = new Date(); 
		hoy.setMinutes(0,0,0);
		return (dateCita = hoy)
	}

	public eliminarCita(){
		this.dataService.delete('/reserva/'+this.selectedCita.id)
            .then(response => {
            },
            error => {
                this.reservas = this.reservas.filter(
                	(el)=>(el.id != this.selectedCita.id)
                );
                this.obtieneCitasBarberia(this);
                this.modalRef.hide();
            });
	}

	public eliminarPausa(){
		this.dataService.delete('/pausaHorarioBarbero/'+this.selectedPausa.id)
            .then(response => {
            },
            error => {
                this.pausas = this.pausas.filter(
                	(el)=>(el.id != this.selectedPausa.id)
                );
                this.modalRef.hide();
            });
	}

	public dateSelectedChange(event){
		this.selectedPausa.fecha = event.getMonth() +'/'+ event.getDate() +'/'+ event.getFullYear();
	}

	public contains(text){
		if(this.selectedPausa.dia){
			return (this.selectedPausa.dia.indexOf(text) != -1);
		}
		return false;
	}

	public toogleRe(text){
		var daysMap = ['LU','MA','MI','JU','VI','SA','DO'];
		if(this.selectedPausa.dia.indexOf(text) == -1){
			this.selectedPausa.dia = this.selectedPausa.dia + ' '+text;
			var optionalArray = this.selectedPausa.dia.split(' ');
			optionalArray.shift();
			var other = daysMap.filter((el)=>(optionalArray.indexOf(el) > -1));
			this.selectedPausa.dia = ' ' + other.toString().split(',').join(' ');
		} else {
			this.selectedPausa.dia = this.selectedPausa.dia.replace(' '+text, "");
			this.selectedPausa.dia = this.selectedPausa.dia.replace(text, "");
		}
	}

	public convierteTiempo(hora){
		hora = hora + '';
		if(hora.length==3){
			hora = '0'+hora;
		}
		var nuevaHora = '';
		if(Number(hora.substring(0, 2)) > 12){
			var primeros = (Number(hora.substring(0, 2)) - 12) + '';
			if(primeros.length==1){
				primeros = '0'+primeros;
			}
			nuevaHora = primeros +":"+ hora.substring(2, 4) +' pm';
		} else {
			nuevaHora = hora.substring(0, 2)+":"+ hora.substring(2, 4) +' am';
		}
		return nuevaHora;
	}

	public modificarPausa(){
		this.pausaErrores = this.validatorService.validaPausa(this.selectedPausa);
		if(this.pausaErrores.length == 0){
			var pausa = Object.assign({},this.selectedPausa);
			pausa.horaInicial = this.modificaHoraToTimeUno(pausa.horaInicial);
			this.dataService.post('/pausaHorarioBarbero/?method=put', {"pausaHorarioBarbero":pausa})
	            .then(response => {
	            	alert('Pausa Modificada');
	                // this.pausas.push(response.pausaHorarioBarbero);
	                this.dataService.get('/pausaHorarioBarbero/?idUsuario='+this.authService.loggedUser.id)
		            .then(response => {
		                this.pausas = this.updateTimeToHora(response.pausaHorarioBarbero);
		            },
		            error => {
		            });
	            },
	            error => {
	            });
			this.modalRef.hide();
		}
	}

	public agregarNuevaPausa(){
		this.pausaErrores = this.validatorService.validaPausa(this.selectedPausa);
		if(this.pausaErrores.length == 0){
			//this.authService.nuevoUsuario(this.usuario);
			this.selectedPausa.estado = 1
			this.selectedPausa.idUsuario = this.authService.loggedUser.id;
			var pausa = Object.assign({},this.selectedPausa);
			pausa.horaInicial = this.modificaHoraToTimeUno(pausa.horaInicial);
			this.dataService.post('/pausaHorarioBarbero/', {"pausaHorarioBarbero":pausa})
	            .then(response => {
	                this.dataService.get('/pausaHorarioBarbero/?idUsuario='+this.authService.loggedUser.id)
		            .then(response => {
		            	alert('Pausa Agregada');
		                this.pausas = this.updateTimeToHora(response.pausaHorarioBarbero);
		            },
		            error => {
		            });
	            },
	            error => {
	            });
			this.modalRef.hide();
		}
	}

	public obtieneInfo(cita){
		this.correosBarberoDisplay = [];
		this.telefonosBarberoDisplay = [];
		this.correosUsuarioDisplay = [];
		this.telefonosUsuarioDisplay = [];
		this.dataService.get('/usuario/'+cita.idUsuarioBarbero)
		.then(response => {
	                this.telefonosBarberoDisplay = response.usuario.telefono;
	                this.correosBarberoDisplay = response.usuario.correo;
	            },
	            error => {
	            });
		this.dataService.get('/usuario/'+cita.idUsuarioReserva)
		.then(response => {
	                this.telefonosUsuarioDisplay = response.usuario.telefono;
	                this.correosUsuarioDisplay = response.usuario.correo;
	            },
	            error => {
	            });
	}

	public modificaHoraToTimeUno(hora){
		hora = hora + '';
		if(hora.length == 3){
			hora="0"+hora;
		}
		return hora.substring(0, 2)+":"+ hora.substring(2, 4) +':00';
	}

	public modificaHoraToTime(horario){
		horario.horaInicial = horario.horaInicial + '';
		horario.horaFinal = horario.horaFinal + '';
		if(horario.horaInicial.length == 3){
			horario.horaInicial="0"+horario.horaInicial;
		}
		horario.horaInicial = horario.horaInicial.substring(0, 2)+":"+ horario.horaInicial.substring(2, 4)+":00";
		if(horario.horaFinal.length == 3){
			horario.horaFinal="0"+horario.horaFinal;
		}
		horario.horaFinal = horario.horaFinal.substring(0, 2)+":"+ horario.horaFinal.substring(2, 4)+":00";
		return horario;
	}

	public addTelefono(){
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
	            },
	            error => {
	            });
		} else {
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del telefono"
		}
	}

	public removeTelefono(telefono){
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

	public addCorreo(){
		this.validationError = false;
		if(this.validatorService.emailValid(this.nuevoCorreo)){
			var cor = new Correo();
			cor.correo = this.nuevoCorreo +'';
			cor.idUsuario = this.authService.loggedUser.id;
			var that = this;
			this.dataService.post('/usuarioCorreo/', {"correo":cor})
	            .then(response => {
	                that.authService.loggedUser.correo.push(cor);
	                that.nuevoUsuario = that.authService.loggedUser;
	                that.authService.updateStoredUser();
					that.nuevoCorreo = null;
	            },
	            error => {
	            });
		} else {
			this.validationError = true;
			this.validationErrorMsg = "Revise el formato del correo"
		}
	}

	public removeCorreo(correo){
		var that = this;
		this.dataService.delete('/usuarioCorreo/'+correo.idCorreo)
	            .then(response => {
	            },
	            error => {
	            });
	    that.nuevoUsuario.correo = that.nuevoUsuario.correo.filter(function(el) {
		    return el.correo !== correo.correo;
		});
		
	}

	public updateHorarios(){
		this.agregaHorario();
	}

	public agregaHorario(){
		var daysMap = [this.selectedHorarioLunes,this.selectedHorarioMartes,this.selectedHorarioMiercoles,
			this.selectedHorarioJueves,this.selectedHorarioViernes,this.selectedHorarioSabado,this.selectedHorarioDomingo];
		var dayInUse = 0;
		var that = this;
		var agregar = function(dia){
			that.cargando = true;
			that.dataService.post('/horarioBarbero/?method=put', {"horarioBarbero":that.modificaHoraToTime(Object.assign({}, dia))})
            .then(response => {
                // that.authService.loggedUser.horarios.push(response.usuario);
                dayInUse = dayInUse + 1;
                if(dayInUse <= 6){
					agregar(daysMap[dayInUse]);
				} else {
					that.cargando = false;
					that.dataService.get('/usuario/'+that.authService.loggedUser.id)
					.then(res => {
						that.authService.loggedUser.horarios = res.usuario.horarios;
					},
		            error => {
		            });
				}
            },
            error => {
            });
		}
		agregar(daysMap[dayInUse]);
	}

	public fechaInicialChanges(event){
		if(event != "--"){
			this.resumenFechaInicial = event;
		}
	}

	public fechaFinalChanges(event){
		if(event != "--"){
			this.resumenFechaFinal = event;
		}
	}


	public generar(){
		let barberoId = this.authService.loggedUser.id;
		if(this.authService.isAdminSucursalUser()){
			barberoId = this.selectedBarbero;
		}
		var resIni = new Date(this.resumenFechaInicial);
		resIni.setDate(resIni.getDate()+1);
		var resFin = new Date(this.resumenFechaFinal);
		resFin.setDate(resFin.getDate()+1);
		if(resIni.getTime() > resFin.getTime()){
			alert('La fecha inicial debe de ser menor a la fecha final');
		}
		if(resIni.getTime() <= resFin.getTime() && this.resumenFechaInicial && this.resumenFechaFinal){
			this.resumenGenerado = false;
			this.cargando = true;
			this.ganancias = 0;
			this.dataService.get('/reserva/?idUsuarioBarbero='+barberoId+'&fechaInicial='+this.resumenFechaInicial+'&fechaFinal='+this.resumenFechaFinal)
	            .then(response => {
	                this.reservasResumen = response.reserva;
	               	this.cantidadCitas = this.reservasResumen.length;
	                for (var i = this.reservasResumen.length - 1; i >= 0; i--) {
	                	let ganancia = (this.reservasResumen[i].esDinamico == 1) ? this.reservasResumen[i].precioDinamico : this.reservasResumen[i].precio;
	                	this.ganancias += Number(ganancia);
	                }
	                this.resumenGenerado = true;
	                this.cargando = false;
	            },
	            error => {
	            });
		}
	}

	public convertMinsToHrsMins(mins) {
		if(mins > 60){
			let tiempo = 'Horas'
			let h:any = Math.floor(mins / 60);
			let m:any = mins % 60;
			h = h < 10 ? '0' + h : h;
			m = m < 10 ? '0' + m : m;
			return `${h}:${m} ${tiempo}`;
		} else {
			return `${mins} Minutos`;
		}
	}
}
