import { Component, OnInit ,TemplateRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ValidatorService } from '../services/validator.service';
import { DataService } from '../services/data.service';
import { Usuario } from '../models/usuario';
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';


@Component({
	selector: 'app-configuracion',
	templateUrl: './configuracion.component.html',
	styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

	public modalRef: BsModalRef;
	public nuevaBarberia:any = {};
	public accion:string = '';
	public opcionesDuracion: any = [];
	public nuevoServicio: any = {
		esDinamico: false
	};
	public nuevoBarbero: any = new Usuario();
	public barberoErrores: any = [];
	public barberiaErrores: any = [];
	public servicioErrores: any = [];
	public selectedServicioId : number;
	public selectedBarberoId : number;
	public selectedBarberiaId : number;
	public nuevoTelefono: number;
	public nuevoCorreo:string;
	public provincias : any = [];
	public cantones : any = [];
	public sucursales: any = [];
	public barberos : any = [];
	public cantonesDisplay : any ;
	public selectedProvincia : any ;
	public Object : any = Object;
	public errorDisplay: string = '';
	public barberoAdmistrador: boolean = false;
	public cargando:boolean = false;

	constructor(private modalService: BsModalService,public authService:AuthService, public validatorService:ValidatorService, private dataService:DataService) {}

	public openModal(template: TemplateRef<any>) {
		this.modalRef = this.modalService.show(template);
	}

	ngOnInit() {
		this.provincias = ["San José","Alajuela","Cartago","Heredia","Guanacaste","Puntarenas","Limón"];
		this.dataService.get('/provinciaCanton')
            .then(response => {
                console.log('success',response);
                this.cantones = response.ProvinciaCanton;
                this.cantonesDisplay = this.cantones[0].cantones;
                this.selectedProvincia = '0';
            },
            error => {
            })

		this.opcionesDuracion = [];
		for (var i = 1; i < 6; i++) {
			this.opcionesDuracion.push(this.authService.loggedUser.tiempoBarbero * i);
		}
		if(this.authService.isAdminUser()){
			//obtiene sucursales
			this.cargando = true;
			this.dataService.get('/sucursal/?idBarberia='+this.authService.idBarberia)
	            .then(response => {
	                console.log('success Sucursales',response);
	                this.sucursales = response.sucursal;
	                if(this.sucursales.length > 0){
		                this.nuevaBarberia = this.sucursales[0];
						this.selectedBarberiaId = this.nuevaBarberia.id;
						this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
				            .then(response => {
				                console.log('success barberos',response);
				                this.barberos = response.usuario;
				                this.nuevoBarbero = Object.assign({},this.barberos[0]);
				                if(this.barberos.length > 0){
									this.opcionesDuracion = [];
					                for (var i = 1; i < 6; i++) {
										this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
									}
								}
								this.selectedBarberoId = this.nuevoBarbero.id;
				                if(this.selectedBarberoId != undefined){
				                	this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
				                }
								if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
									this.nuevoServicio = this.nuevoBarbero.servicios[0];
									this.selectedServicioId = this.nuevoServicio.id;
								}
								this.cargando = false;
				            },
				            error => {
				            })
				    }
	            },
	            error => {
	            })
		}
		if(this.authService.isAdminSucursalUser()){
			this.cargando = true;
			this.dataService.get('/sucursal/' + this.authService.loggedUser.idSucursal) 
	            .then(response => {
	                console.log('success Sucursales',response);
	                this.sucursales = response;
	                if(this.sucursales.length > 0){
		                this.nuevaBarberia = this.sucursales[0];
						this.selectedBarberiaId = this.nuevaBarberia.id;
						this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
				            .then(response => {
				                console.log('success barberos',response);
				                this.barberos = response.usuario;
				                this.nuevoBarbero = Object.assign({},this.barberos[0]);
				                if(this.barberos.length > 0){
				                	this.opcionesDuracion = [];
					                for (var i = 1; i < 6; i++) {
										this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
									}
								}
								this.selectedBarberoId = this.nuevoBarbero.id;
				                if(this.selectedBarberoId != undefined){
				                	this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
				                }
								if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
									this.nuevoServicio = this.nuevoBarbero.servicios[0];
									this.selectedServicioId = this.nuevoServicio.id;
								}
								this.cargando = false;
				            },
				            error => {
				            })
				    }
	            },
	            error => {
	            })
		}
		if(this.authService.isBarberoUser() && !this.authService.isAdminUser()){
			//obtener toda la info del barbero
			console.log('here',this.authService.loggedUser.servicios);
			this.nuevoBarbero = Object.assign({},this.authService.loggedUser);
			this.opcionesDuracion = [];
			for (var i = 1; i < 6; i++) {
				this.opcionesDuracion.push(this.authService.loggedUser.tiempoBarbero * i);
			}
			this.selectedBarberoId = this.nuevoBarbero.id;
			if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
				this.nuevoServicio = this.nuevoBarbero.servicios[0];
				this.selectedServicioId = this.nuevoServicio.id;
			}
		} 
		//else {
			// obtener todos los barberos de la sucursal seleccionada por el admin
			//this.nuevoBarbero = this.barberos[0];
			//this.selectedBarberoId = this.nuevoBarbero.id;
		//}
	}

	public addTelefonoBarberia(){
		console.log('nuevo',this.nuevoTelefono);
		let nuevoTelefono : string = ''+this.nuevoTelefono;
		if(nuevoTelefono.length == 8){
			var tel = new Telefono();
			tel.telefono = this.nuevoTelefono +'';
	  		if(!this.nuevaBarberia.telefono) this.nuevaBarberia.telefono = [];
			this.nuevaBarberia.telefono.push(tel);
			this.nuevoTelefono = null;
		}
	}

	public removeTelefonoBarberia(telefono){
		console.log('remove',telefono);
		this.nuevaBarberia.telefono = this.nuevaBarberia.telefono.filter(function(el) {
		    return el.telefono !== telefono.telefono;
		});
	}

	public addCorreoBarberia(){
		console.log('nuevo',this.nuevoCorreo);
		if(this.validatorService.emailValid(this.nuevoCorreo)){
			var cor = new Correo();
			cor.correo = this.nuevoCorreo +'';
	  		if(!this.nuevaBarberia.correo) this.nuevaBarberia.correo = [];
			this.nuevaBarberia.correo.push(cor);
			this.nuevoCorreo = null;
		}
	}

	public removeCorreoBarberia(correo){
		console.log('remove',correo);
		this.nuevaBarberia.correo = this.nuevaBarberia.correo.filter(function(el) {
		    return el.correo !== correo.correo;
		});
	}

	public addTelefono(){
		console.log('nuevo',this.nuevoTelefono);
		let nuevoTelefono : string = ''+this.nuevoTelefono;
		if(nuevoTelefono.length == 8){
			var tel = new Telefono();
			tel.telefono = this.nuevoTelefono +'';
	  		if(!this.nuevoBarbero.telefono) this.nuevoBarbero.telefono = [];
			this.nuevoBarbero.telefono.push(tel);
			this.nuevoTelefono = null;
		}
	}

	public removeTelefono(telefono){
		console.log('remove',telefono);
		this.nuevoBarbero.telefono = this.nuevoBarbero.telefono.filter(function(el) {
		    return el.telefono !== telefono.telefono;
		});
	}

	public addCorreo(){
		console.log('nuevo',this.nuevoCorreo);
		if(this.validatorService.emailValid(this.nuevoCorreo)){
			var cor = new Correo();
			cor.correo = this.nuevoCorreo +'';
	  		if(!this.nuevoBarbero.correo) this.nuevoBarbero.correo = [];
			this.nuevoBarbero.correo.push(cor);
			this.nuevoCorreo = null;
		}
	}

	public removeCorreo(correo){
		console.log('remove',correo);
		this.nuevoBarbero.correo = this.nuevoBarbero.correo.filter(function(el) {
		    return el.correo !== correo.correo;
		});
	}

	public provinciaChanged(id){
		this.cantonesDisplay = this.cantones[id].cantones;
		this.nuevaBarberia.idCanton = this.cantonesDisplay[0].id;
		this.selectedProvincia = id;
	}

	public changeSucursal(sucursal){
		console.log('suc',sucursal);
		this.selectedBarberiaId = sucursal;
		this.nuevaBarberia = Object.assign({}, this.sucursales.find(o => o.id == sucursal));
		this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
            .then(response => {
                console.log('success barberos',response);
                this.barberos = response.usuario;
                if(this.barberos instanceof Array){

                } else {
                	this.barberos = [this.barberos];
                }
                this.nuevoBarbero = Object.assign({},this.barberos[0]);
                if(this.barberos.length > 0){
                	this.opcionesDuracion = [];
	                for (var i = 1; i < 6; i++) {
						this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
					}
				}
				this.selectedBarberoId = this.nuevoBarbero.id;
				if(this.selectedBarberoId != undefined){
					this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
				}
				if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
					this.nuevoServicio = this.nuevoBarbero.servicios[0];
					this.selectedServicioId = this.nuevoServicio.id;
				}
            },
            error => {
            })
	}

	public changeBarbero(barbero){
		this.selectedBarberoId = barbero;
		this.nuevoBarbero = Object.assign({}, this.barberos.find(o => o.id == barbero));
        console.log('nuevoBarbero')
        console.log(this.nuevoBarbero);
        this.opcionesDuracion = [];
        for (var i = 1; i < 6; i++) {
			this.opcionesDuracion.push(this.nuevoBarbero.tiempoBarbero * i);
		}
		this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
		//Obtiene servicios
	}

	public changeServicio(servicio){
		this.selectedServicioId = servicio;
		this.nuevoServicio = Object.assign({}, this.nuevoBarbero.servicios.find(o => o.id == servicio));
	}

	public actualizaServicioSelected(){
		this.barberoErrores = [];
		this.barberiaErrores = [];
		this.servicioErrores = [];
		this.nuevoServicio = Object.assign({}, this.nuevoBarbero.servicios.find(o => o.id == this.selectedServicioId));
	}

	public actualizaBarberoSelected(){
		this.barberoErrores = [];
		this.barberiaErrores = [];
		this.servicioErrores = [];
		this.nuevoBarbero = Object.assign({}, this.barberos.find(o => o.id == this.selectedBarberoId));
        this.opcionesDuracion = [];
        for (var i = 1; i < 6; i++) {
			this.opcionesDuracion.push(this.nuevoBarbero.tiempoBarbero * i);
		}
	}

	public actualizaSucursalSelected(){
		this.barberoErrores = [];
		this.barberiaErrores = [];
		this.servicioErrores = [];
		this.nuevaBarberia = Object.assign({}, this.sucursales.find(o => o.id == this.selectedBarberiaId));
		if(this.barberos.length > 0){
			this.opcionesDuracion = [];
            for (var i = 1; i < 6; i++) {
				this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
			}
		}
	}


	public AgregarBarberia(){
		this.barberiaErrores = this.validatorService.validaBarberia(this.nuevaBarberia);
		console.log('this.barberiaErrores',this.barberiaErrores);
		if(this.barberiaErrores.length == 0){
			//this.authService.nuevoUsuario(this.usuario);
			console.log('agregar Barberia',this.nuevaBarberia);
			this.nuevaBarberia.estado = 1;
			this.nuevaBarberia.idBarberia = this.authService.idBarberia;
			this.cargando = true;
			this.dataService.post('/sucursal/', {"sucursal":this.nuevaBarberia})
            .then(response => {
            	let url = '/sucursal/?idBarberia='+this.authService.idBarberia;
            	if(this.authService.isAdminSucursalUser()){
            		url = '/sucursal/' + this.authService.loggedUser.idSucursal;
            	}
                this.dataService.get(url)
	            .then(response => {
	                console.log('success Sucursales',response);
	                this.sucursales = response.sucursal;
	                this.nuevaBarberia = this.sucursales[0];
					this.selectedBarberiaId = this.nuevaBarberia.id;
					this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
			            .then(response => {
			                console.log('success barberos',response);
			                this.barberos = response.usuario;
			                this.nuevoBarbero = Object.assign({},this.barberos[0]);
			                if(this.barberos.length > 0){
			                	this.opcionesDuracion = [];
				                for (var i = 1; i < 6; i++) {
									this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
								}
							}
							this.selectedBarberoId = this.nuevoBarbero.id;
							this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
							if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
								this.nuevoServicio = this.nuevoBarbero.servicios[0];
								this.selectedServicioId = this.nuevoServicio.id;
							}
							this.cargando = false;
							this.errorDisplay = '';
							alert('Sucursal agregada');
							this.modalRef.hide();
			            },
			            error => {
			            	this.cargando = false;
			            })
	            },
	            error => {
	            	this.cargando = false;
	            })
            },
            error => {
            	this.cargando = false;
            });
		}
	}

	public ModificarBarberia(){
		this.barberiaErrores = this.validatorService.validaBarberia(this.nuevaBarberia);
		if(this.barberiaErrores.length == 0){
			console.log('modificar Barberia',this.nuevaBarberia);
			this.cargando = true;
			this.dataService.post('/sucursal/?method=PUT', {"sucursal":this.nuevaBarberia})
            .then(response => {
                let url = '/sucursal/?idBarberia='+this.authService.idBarberia;
            	if(this.authService.isAdminSucursalUser()){
            		url = '/sucursal/' + this.authService.loggedUser.idSucursal;
            	}
                this.dataService.get(url)
	            .then(response => {
	                console.log('success Sucursales',response);
	                this.sucursales = response;
	                if(!this.authService.isAdminSucursalUser()){
	                	this.sucursales = response.sucursal;
	                }
	                this.nuevaBarberia = this.sucursales[0];
					this.selectedBarberiaId = this.nuevaBarberia.id;
					this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
			            .then(response => {
			                console.log('success barberos',response);
			                this.barberos = response.usuario;
			                this.nuevoBarbero = Object.assign({},this.barberos[0]);
			                if(this.barberos.length > 0){
			                	this.opcionesDuracion = [];
				                for (var i = 1; i < 6; i++) {
									this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
								}
							}
							this.selectedBarberoId = this.nuevoBarbero.id;
							this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
							if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
								this.nuevoServicio = this.nuevoBarbero.servicios[0];
								this.selectedServicioId = this.nuevoServicio.id;
							}
							alert('Sucursal Modificada');
							this.cargando = false;
							this.modalRef.hide();
			            },
			            error => {
			            	this.cargando = false;
			            })
	            },
	            error => {
	            	this.cargando = false;
	            })
            },
            error => {
            	this.cargando = false;
                console.log('error',error);
            });
		}
	}

	public EliminarBarberia(){
		console.log('eliminar Barberia',this.nuevaBarberia);
		this.dataService.delete('/sucursal/'+this.nuevaBarberia.id)
            .then(response => {
                console.log('eliminado',response);
            },
            error => {
            	console.log('here');
            	let url = '/sucursal/?idBarberia='+this.authService.idBarberia;
            	if(this.authService.isAdminSucursalUser()){
            		url = '/sucursal/' + this.authService.loggedUser.idSucursal;
            	}
                this.dataService.get(url)
	            .then(response => {
	                console.log('success Sucursales',response);
	                this.sucursales = response.sucursal;
	                this.nuevaBarberia = this.sucursales[0];
					this.selectedBarberiaId = this.nuevaBarberia.id;
					this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
			            .then(response => {
			                console.log('success barberos',response);
			                this.barberos = response.usuario;
			                this.nuevoBarbero = Object.assign({},this.barberos[0]);
			                if(this.barberos.length > 0){
			                	this.opcionesDuracion = [];
				                for (var i = 1; i < 6; i++) {
									this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
								}
							}
							this.selectedBarberoId = this.nuevoBarbero.id;
							this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
							if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
								this.nuevoServicio = this.nuevoBarbero.servicios[0];
								this.selectedServicioId = this.nuevoServicio.id;
							}
							this.modalRef.hide();
			            },
			            error => {
			            })
	            },
	            error => {
	            })
            });
	}

	public AgregarServicio(){
		if(this.nuevoServicio.esDinamico){
			this.nuevoServicio.precio = 1;
			this.nuevoServicio.duracion = 1;
			this.nuevoServicio.esDinamico = 1;
		} else {
			this.nuevoServicio.esDinamico = 0;
		}
		this.servicioErrores = this.validatorService.validaServicio(this.nuevoServicio);
		if(this.servicioErrores.length == 0){
			//this.authService.nuevoUsuario(this.usuario);
			this.nuevoServicio.idUsuario = this.selectedBarberoId;
			this.nuevoServicio.estado = 1;
			this.cargando = true;
			this.dataService.post('/servicio/', {"servicio":this.nuevoServicio})
            .then(response => {
                console.log('agregado',response);
                this.nuevoBarbero.servicios.push(response.servicio);
                this.modalRef.hide();
                this.nuevoServicio = this.nuevoBarbero.servicios[0];
				this.selectedServicioId = this.nuevoServicio.id;
				this.cargando = false;
				alert('Servicio agregado');
            },
            error => {
            	this.cargando = false;
                console.log('error',error);
            });
			console.log('agregar servicio',this.nuevoServicio);
		}
		console.log(this.servicioErrores);
	}

	public ModificarServicio(){
		if(this.nuevoServicio.esDinamico){
			this.nuevoServicio.precio = 1;
			this.nuevoServicio.duracion = 1;
			this.nuevoServicio.esDinamico = 1;
		} else {
			this.nuevoServicio.esDinamico = 0;
		}
		this.servicioErrores = this.validatorService.validaServicio(this.nuevoServicio);
		if(this.servicioErrores.length == 0){
			this.cargando = true;
			this.dataService.post('/servicio/?method=put', {"servicio":this.nuevoServicio})
            .then(response => {
                console.log('modificado',response);
                //this.nuevoBarbero.servicios.push(response.servicio);
                this.nuevoBarbero.servicios = this.nuevoBarbero.servicios.filter(
                	(el)=>(el.id != this.nuevoServicio.id)
                	);
                this.nuevoBarbero.servicios.push(response.servicio);
                this.modalRef.hide();
                this.cargando = false;
                alert('Servicio Modificado');
            },
            error => {
            	this.cargando = false;
                console.log('error',error);
            });
			console.log('modificar servicio',this.nuevoServicio);
		}
	}

	public EliminarServicio(){
		console.log('eliminar Servicio',this.nuevoServicio);
		this.dataService.delete('/servicio/'+this.nuevoServicio.id)
            .then(response => {
                console.log('eliminado',response);
            },
            error => {
            	console.log('here');
            	this.nuevoBarbero.servicios = this.nuevoBarbero.servicios.filter(
                	(el)=>(el.id != this.nuevoServicio.id)
                );
                this.modalRef.hide();
            });
	}



	public AgregarBarbero(){
		this.nuevoBarbero.rol = 'B';
		if(this.barberoAdmistrador){
			this.nuevoBarbero.rol += 'A';
		}
		this.nuevoBarbero.contrasenna = 'temporal';
		this.nuevoBarbero.tipo = 'N';
		this.nuevoBarbero.estado = 1;
		this.nuevoBarbero.idSucursal = this.selectedBarberiaId;
		this.barberoErrores = this.validatorService.validaBarbero(this.nuevoBarbero);
		console.log(this.barberoErrores);
		if(this.barberoErrores.length == 0){
			//this.authService.nuevoUsuario(this.usuario);
			this.cargando = true;
			this.dataService.post('/usuario/', {"usuario":this.nuevoBarbero})
            .then(response => {
            	if(response.error){
                    this.errorDisplay = 'Por favor seleccione otro usuario.'
                    this.cargando = false;
                }
                else{
	                console.log('modificado',response);
	                //this.barberos.push(response.usuario);
	                this.agregaHorario(response.usuario.id);
	                // this.modalRef.hide();
	                // alert('Barbero agregado');
	            }
            },
            error => {
            	this.cargando = false;
                console.log('error',error);
            });
			console.log('agregar Barbero',this.nuevoBarbero);
		}
		
	}

	public agregaHorario(idUsuario){
		var daysMap = ['LU','MA','MI','JU','VI','SA','DO'];
		var dayInUse = 0;
		var that = this;
		var agregar = function(dia){
			var horario = {
				idUsuario:idUsuario,
				dia: dia,
				horaInicial: "09:00:00",
				horaFinal: "20:00:00",
				estado:1
			}
			that.dataService.post('/horarioBarbero/', {"horarioBarbero":horario})
            .then(response => {
                console.log('agregado',response);
                // that.authService.loggedUser.horarios.push(response.usuario);
                dayInUse = dayInUse + 1;
                if(dayInUse <= 6){
					agregar(daysMap[dayInUse]);
				} else {
					that.dataService.get('/usuario/?idSucursal='+that.nuevaBarberia.id)
			            .then(response => {
			                console.log('success barberos',response);
			                that.barberos = response.usuario;
			                that.nuevoBarbero = Object.assign({},that.barberos[0]);
			                if(that.barberos.length > 0){
			                	that.opcionesDuracion = [];
				                for (var i = 1; i < 6; i++) {
									that.opcionesDuracion.push(that.barberos[0].tiempoBarbero * i);
								}
							}
							that.selectedBarberoId = that.nuevoBarbero.id;
							that.barberoAdmistrador = (that.nuevoBarbero.rol.indexOf('A') != -1);
							if(that.nuevoBarbero.servicios && that.nuevoBarbero.servicios.length > 0){
								that.nuevoServicio = that.nuevoBarbero.servicios[0];
								that.selectedServicioId = that.nuevoServicio.id;
							}
							that.modalRef.hide();
							that.cargando = false;
							alert('Barbero agregado');
			            },
			            error => {
			            });
				}
            },
            error => {
                console.log('error',error);
            });
		}
		agregar(daysMap[dayInUse]);
	}

	public ModificarBarbero(){
		this.barberoErrores = this.validatorService.validaBarbero(this.nuevoBarbero);
		if(this.barberoErrores.length == 0){
			//this.authService.nuevoUsuario(this.usuario);
			console.log('modificar Barbero',this.nuevoBarbero);
			this.cargando = true;
			this.dataService.post('/usuario/?method=PUT', {"usuario":this.nuevoBarbero})
            .then(response => {
                this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
		            .then(response => {
		                console.log('success barberos',response);
		                this.barberos = response.usuario;
		                this.nuevoBarbero = Object.assign({},this.barberos[0]);
		                if(this.barberos.length > 0){
		                	this.opcionesDuracion = [];
			                for (var i = 1; i < 6; i++) {
								this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
							}
						}
						this.selectedBarberoId = this.nuevoBarbero.id;
						this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
						if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
							this.nuevoServicio = this.nuevoBarbero.servicios[0];
							this.selectedServicioId = this.nuevoServicio.id;
						}
						alert('Barbero Modificado');
						this.cargando = false;
						this.modalRef.hide();

		            },
		            error => {
		            	this.cargando = false;
		            })
            },
            error => {
            	this.cargando = false;
                console.log('error',error);
            });
		}
		
	}

	public EliminarBarbero(){
		console.log('eliminar Barbero',this.nuevoBarbero);
		this.dataService.delete('/usuario/'+this.nuevoBarbero.id)
            .then(response => {
                console.log('eliminado',response);
            },
            error => {
            	this.dataService.get('/usuario/?idSucursal='+this.nuevaBarberia.id)
	            .then(response => {

            		this.modalRef.hide();
	                console.log('success barberos',response);
	                this.barberos = response.usuario;
	                if(this.barberos instanceof Array){

	                } else {
	                	this.barberos = [this.barberos];
	                }
	                this.nuevoBarbero = Object.assign({},this.barberos[0]);
	                if(this.barberos.length > 0){
	                	this.opcionesDuracion = [];
		                for (var i = 1; i < 6; i++) {
							this.opcionesDuracion.push(this.barberos[0].tiempoBarbero * i);
						}
					}
					this.selectedBarberoId = this.nuevoBarbero.id;
					this.barberoAdmistrador = (this.nuevoBarbero.rol.indexOf('A') != -1);
					if(this.nuevoBarbero.servicios && this.nuevoBarbero.servicios.length > 0){
						this.nuevoServicio = this.nuevoBarbero.servicios[0];
						this.selectedServicioId = this.nuevoServicio.id;
					}
	            },
	            error => {
	            })
            });
	}

	public impersonar(){
		this.authService.impersonar(this.nuevoBarbero);
	}

}
