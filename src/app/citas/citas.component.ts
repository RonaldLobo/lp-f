import { Component, OnInit ,TemplateRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { FacturaService } from '../services/factura.service';
import { WindowRefService } from '../services/window.service';
import { ValidatorService } from '../services/validator.service';
import { SharedService } from '../services/shared.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Usuario } from '../models/usuario';
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';

import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';

declare var window;
import * as _ from "lodash";



@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
	public modalRef: BsModalRef;
	printRefCompletar: BsModalRef;
	public displayCitas: boolean = false;
	public correosUsuarioDisplay :any = [];
	public telefonosUsuarioDisplay :any = [];
	public correosBarberoDisplay :any = [];
	public telefonosBarberoDisplay :any = [];
	public Object : any = Object;

	public tiposPago = ['Efectivo','Tarjeta','Cheque','Transferencia','Tercero','Otros'];
	public cargandoCitas: boolean = false;
	public reservas: any = [];
	public sucursal: any = [];
	public selectedDate : any = new Date();
	public displayCitasBarberia : boolean = true;
	public selectedDateBarberia : any = new Date();


	public resumenFechaFinal: string = '';
	public resumenFechaInicial: string = '';
	public reservasResumen: any = [];
	public resumenGenerado: boolean = false;
	public cantidadCitas: number = 0;
	public ganancias : number = 0;

	public selectedBarbero: number;

	public cargando:boolean = true;
	public mostrarModificar:boolean = false;
	public mostrarSeleccionar:boolean = false;
	public nuevoUsuarioDisplay:boolean = false;
	public spinnerEmitiendoFactura: boolean = false;
	public busquedaXNom: boolean = false;
 	public enviandoMH: boolean = false;
	public validationError: boolean = false;

	public nuevoUsuario:Usuario = new Usuario();
	public usuarioErrores : any = [];

	public nuevoTelefono: number;
	public nuevoCorreo:string;		

	public validationErrorMsg: string = '';	
	public selectedCita:any={};
	public factura:any={};
	public productos:any={};
	public selectedDateNoFormat: string = '';
	public today= new Date();	
	public facturaHacienda : any = {};
	public detalleFactura: any = [];
	public selectedProvincia : any = {};
 	public selectedCanton : any = {};
 	public clienteCitas :any = [];

 	public ubicacion : any = {};

	public buscaUsuario:string = "";
	public usuarioCita: any = [];
	public provincias: any = [];
	public buscaCliente:string = "";


    constructor(
    		private modalService: BsModalService,
    		public authService:AuthService, 
    		private validatorService:ValidatorService,
    		private dataService:DataService, 
    		private windowRef: WindowRefService, 
    		private facturaService:FacturaService,
    		private sharedService:SharedService,
    		private decimalPipe:DecimalPipe,
    		private datePipe:DatePipe
    ) {}

    ngOnInit() {
		if(window.screen.width > 900){
			this.displayCitas = true;
			this.displayCitasBarberia = true;
		}
		var that = this;
		let time = (that.authService.loggedUser) ? 0 : 2000;
		setTimeout(function(){
			if(that.authService.isBarberoUser()){
		        that.cargandoCitas = true;
		        that.dataService.get('/reserva/?idUsuarioBarbero='+that.authService.loggedUser.id+'&fecha='+that.selectedDate.getFullYear()+'-'+that.zerofill(that.selectedDate.getMonth(),1)+'-'+that.zerofill(that.selectedDate.getDate(),0))
		            .then(response => {
		                that.reservas = that.updateTimeToHora(response.reserva);
		                that.cargandoCitas = false;
		            },
		            error => {
		            });
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
		   // if(that.authService.isAdminSucursalUser()){
		    //	that.obtieneCitasBarberia(that);
		   // }
		   //  this.sharedService.get("/api/ubicacion").then((data) =>{
	  		// 	this.provincias = data.ubicacion;
	  		// 	this.selectedProvincia = this.provincias[0];
	  		// 	this.selectedCanton = this.selectedProvincia.cantones[0];
	  		// 	this.nuevoUsuario.distrito = this.selectedCanton.distritos[0].codigo;
	  		// });
		    that.sharedService.get('/api/ubicacion').then((data) => {
		    	console.log('that.authService.loggedUser.idProvincia',that.authService.loggedUser.idProvincia);
  				that.provincias = data.ubicacion;
		        // that.selectedProvincia = data.ubicacion[Number(that.authService.loggedUser.idProvincia) - 1];
		        // that.selectedCanton = that.selectedProvincia.cantones[Number(that.authService.loggedUser.idCanton) - 1];
		        that.ubicacion = data.ubicacion;
		        that.cargando = false;
			},(error)=>{
				console.log('error',error);
			});


			that.obtenerDatosBarberia().then((data) => {
				console.log(data);
				that.sucursal = data[0];
			});

		},time);
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
		this.obtenerInfoUsuario(cita.idUsuarioReserva);
	}

	public obtenerInfoUsuario(id){
		this.dataService.get('/usuario/'+id)
		.then(response => {
	                this.telefonosUsuarioDisplay = response.usuario.telefono;
	                this.correosUsuarioDisplay = response.usuario.correo;
	                this.nuevoUsuario = response.usuario;
	            },
	            error => {
	            });
	}

	public changeBarbero(id){
		this.selectedBarbero = id;
	}

	public convierteTiempo(horaParam){
		var hora = horaParam + '';
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

	public changeDateBarberia(fecha){
		if(this.selectedDateNoFormat != fecha ){
			this.busquedaXNom = false;
			let newDate = new Date(fecha);
			newDate.setDate(newDate.getDate() + 1);
			this.selectedDateBarberia = newDate	;
			this.selectedDateNoFormat = fecha;
			this.obtieneCitasBarberia(this);
		}
	        
	}


	public changeDateBarberia1(option){
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

	public openModalPrint(template: TemplateRef<any>) {
		this.printRefCompletar = this.modalService.show(template);
	}

	public zerofill(i,add) {
		i = i + add;
    	return ((i < 10 ? '0' : '') + i);
	}

	public updateTimeToHora(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
			pausas[i].horaInicialFormat = Number(pausas[i].horaInicial.substring(0, 2) + pausas[i].horaInicial.substring(3, 5));
		}
		return pausas;
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
		//console.log('is admin',this.authService.isAdminSucursalUser());
		if(this.authService.isAdminSucursalUser()){
			//console.log(this.selectedBarbero);
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


	public updateUser(){
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario, false);
		console.log(this.usuarioErrores);
		if(this.usuarioErrores.length == 0){
			this.dataService.post('/usuario/?method=put', {'usuario':this.nuevoUsuario})
	            .then(response => {
	            	alert('Información actualizada');
	            	this.cargando = false;
	                this.mostrarModificar = false;
	                this.obtenerInfoUsuario(this.nuevoUsuario.id);
	               // this.encontroUsuario = false;
	               // this.buscaUsuario = '';
	            },
	            error => {
	            	this.cargando = false;
	        });
        }
	}

	public visualizarModificar(){
		this.mostrarModificar = !this.mostrarModificar;
	}

	public visualizarSeleccionar(){
		this.mostrarSeleccionar = !this.mostrarSeleccionar;
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


	crearFactura(){
		this.factura.idCliente = this.selectedCita.idUsuarioReserva;
        this.factura.idCreadoPor = this.selectedCita.idUsuarioBarbero;
        this.factura.idSucursal = this.authService.loggedUser.idSucursal;
        this.factura.fecha = this.selectedCita.dia;
        this.factura.total = this.selectedCita.precio;
        this.factura.totalImpuesto = '0';
        this.factura.totalDescuento = '0';
        this.factura.totalNeto = this.selectedCita.precio;
        this.factura.moneda = 'C';
        this.factura.detalle = '';
        this.factura.tipoTransaccion = this.selectedCita.tipoPago;
        this.factura.codigo = '';
        this.factura.numComprobante = this.selectedCita.comprobantePago;

        this.productos.producto = this.selectedCita.servicio
        this.productos.idServicio = this.selectedCita.idServicio;
        this.productos.codigo = '';
        this.productos.cantidad = '1';
        this.productos.precio = this.selectedCita.precio;
        this.productos.impuesto = '0';
        this.productos.descuento = '0';
        this.productos.tipoDescuento = '';
        this.productos.razonDescuento = '';
        this.productos.total = this.selectedCita.precio;
        this.productos.unidad = 'Sp';
        this.detalleFactura.push(this.productos);
        this.factura.detalleFactura =[...this.detalleFactura];
	}


public async updateReserva(){
		var that = this;
		await that.facturacionHacienda();
		if (isNaN(Number(that.nuevoUsuario.cedula))){
			alert("Número de Cédula Incorrecta del Cliente " + that.selectedCita.nombreUserReserva + ' ' +
			    		that.selectedCita.primerApellidoUserReserva + ' ' +
			    	    that.selectedCita.segundoApellidoUserReserva);
		}else{
			that.crearFactura();
			var fact = that.facturaHacienda;
			
			fact.con = true;
			that.spinnerEmitiendoFactura = true;
			that.enviandoMH = true;
			that.facturaService.post('',fact)
			.then(res => {
				fact.con = false;
				that.selectedCita.consecutivo = res.resp.consecutivo;
				that.selectedCita.clave = res.resp.clave;


				that.factura.consecutivo = res.resp.consecutivo;
				that.factura.clave = res.resp.clave;

				that.genLetter(function(doc){
					var blob = doc.output("blob");
			    	that.blobToBase64(blob,function(base){
						fact.facturabase = {
							base: base
						};
						that.facturaService.post('',fact)
						.then(res => {
							console.log('res',res);
							if(res.respuesta == "aceptado"){
								that.factura.consecutivo = '';
								that.factura.clave = res.clave;
								that.factura.estado = 'P';
								that.factura.xml = res.xml;
								//that.dataService.post('/factura/?method=put', {'factura':that.factura})

						        that.dataService.post('/factura/',{factura:that.factura})
					             .then(response => {
					             //	that.obtieneCitasBarberia(that);
					             	alert('Factura Emitida Satisfactoriamente');
					             	that.enviandoMH = false;
					             	console.log(response);
									that.selectedCita.estadoFactura = 'P';
								    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita});
					            },
					             error => {
					             	that.enviandoMH = false;
					        	});


							} else if(res.error == "recibido"){
								alert('Su factura fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Factura"');
							
								that.factura.refresh = res.refreshToken;
								that.factura.xml = res.xml;
								that.factura.estadoFactura = 'E';
								that.factura.base = base;

							  //  that.dataService.post('/factura/?method=put', {'factura':that.factura})
					            that.dataService.post('/factura/',{factura:that.factura})
					             .then(response => {
					             	//alert('Información actualizada');
					            	that.enviandoMH = false;
									that.selectedCita.estadoFactura = 'E';
								    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita});
					             	console.log(response);
					            },
					             error => {
					             	that.enviandoMH = false;
					        	});
							} else if(res.respuesta == "rechazado"){
								that.enviandoMH = false;
	 							alert('Factura Rechazada por el Ministerio de Hacienda.');
	 							that.factura.refresh = res.refreshToken;
								that.factura.xml = res.xml;
								that.factura.estadoFactura = 'R';
								that.factura.base = base;

							   // that.dataService.post('/factura/?method=put', {'factura':that.factura})
					             that.dataService.post('/factura/',{factura:that.factura})
					             .then(response => {
									that.selectedCita.estadoFactura = 'N';
								    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita});
					            	that.enviandoMH = false;
					             	console.log(response);
					            },
					             error => {
					             	that.enviandoMH = false;
					        	});
							}else {
								alert('Lo sentimos pero su factura no fue aceptada por el Ministerio de Hacienda, por favor intentelo de nuevo.');
								
							}
						}, err =>{
							console.log('error',err);
							that.enviandoMH = false;
						})
					});
			    });
			}, err =>{
				console.log('error',err);
				that.enviandoMH = false;
				
			});
		}
		that.spinnerEmitiendoFactura = false;
		
	
	}
	public async updateReserva_Vieja(){
		var that = this;
		await that.facturacionHacienda();
		if (isNaN(Number(that.nuevoUsuario.cedula))){
			alert("Número de Cédula Incorrecta del Cliente " + that.selectedCita.nombreUserReserva + ' ' +
			    		that.selectedCita.primerApellidoUserReserva + ' ' +
			    	    that.selectedCita.segundoApellidoUserReserva);
		}else{
			that.crearFactura();
			var fact = that.facturaHacienda;
			
			fact.con = true;
			that.spinnerEmitiendoFactura = true;
			that.enviandoMH = true;
			that.facturaService.post('',fact)
			.then(res => {
				fact.con = false;
				that.selectedCita.consecutivo = res.resp.consecutivo;
				that.selectedCita.clave = res.resp.clave;


				that.factura.consecutivo = res.resp.consecutivo;
				that.factura.clave = res.resp.clave;

				that.genLetter(function(doc){
					var blob = doc.output("blob");
			    	that.blobToBase64(blob,function(base){
						fact.facturabase = {
							base: base
						};
						that.facturaService.post('',fact)
						.then(res => {
							console.log('res',res);
							if(res.respuesta == "aceptado"){
								that.factura.consecutivo = '';
								that.factura.clave = res.clave;
								that.factura.estado = 'P';
								that.factura.xml = res.xml;
								that.dataService.post('/factura/?method=put', {'factura':that.factura})
					             .then(response => {
					             //	that.obtieneCitasBarberia(that);
					             alert('Factura Emitida Satisfactoriamente');
					            that.enviandoMH = false;
					            that.spinnerEmitiendoFactura = false;
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
				             	that.spinnerEmitiendoFactura = false;
						 		that.factura.estado = 'R';
				        	});






								//that.selectedCita.consecutivo = '';
								
								that.factura.estado =  'P';

								that.selectedCita.estadoFactura = 'P';
							    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita})
					             .then(response => {
					             //	alert('Factura Emitida Satisfactoriamente');
					             	that.enviandoMH = false;
					             	that.spinnerEmitiendoFactura = false;
					             	console.log(response);
					            },
					             error => {

					             	console.log('error');
					             	that.enviandoMH = false;
							 		that.selectedCita.estadoFactura = 'R';
							 		that.factura.estado =  'R';

							 		that.spinnerEmitiendoFactura = false;
					        	});


					             that.dataService.post('/factura/',{factura:that.factura})
					             .then(response => {
					             	alert('Factura Emitida Satisfactoriamente');
					             	that.enviandoMH = false;
					             	that.spinnerEmitiendoFactura = false;
					             	console.log(response);
					            },
					             error => {

					             	console.log('error');
					             	that.enviandoMH = false;
							 		that.selectedCita.estadoFactura = 'R';
							 		that.factura.estado =  'R';

							 		that.spinnerEmitiendoFactura = false;
					        	});
							} else if(res.error == "recibido"){
								alert('Su factura fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Factura"');
								that.selectedCita.refresh = res.refreshToken;
								that.selectedCita.xml = res.xml;
								that.selectedCita.estadoFactura = 'E';

						 		that.factura.xml = res.refreshToken;
						        that.factura.refresh =  res.xml;
						        that.factura.estado =  'E';

							    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita})
					             .then(response => {
					             //	alert('Información actualizada');
					            	that.enviandoMH = false;
					            	that.spinnerEmitiendoFactura = false;
					             	console.log(response);
					            },
					             error => {
					             	that.enviandoMH = false;
							 		that.selectedCita.estadoFactura = 'R';

							 		that.factura.estado =  'R';
							 		that.spinnerEmitiendoFactura = false;
					        	});


					            that.dataService.post('/factura/',{factura:that.factura})
					             .then(response => {
					             //	alert('Factura Emitida Satisfactoriamente');
					             	console.log(response);
					            },
					             error => {
					             	that.enviandoMH = false;
							 		that.selectedCita.estadoFactura = 'R';

							 		that.factura.estado =  'R';
							 		that.spinnerEmitiendoFactura = false;
					        	});
							} else {
								that.enviandoMH = false;
	 							alert('Factura Rechazada por el Ministerio de Hacienda, volver a intentar.');
	 							that.spinnerEmitiendoFactura = false;
							}
						}, err =>{
							console.log('error',err);
							that.enviandoMH = false;
							that.spinnerEmitiendoFactura = false;
						})
					});
			    });
			}, err =>{
				console.log('error',err);
				that.enviandoMH = false;
				that.spinnerEmitiendoFactura = false;
			});
		}

		
	
	}




	public async reenviarMH(){
		var that = this;
		await this.facturacionHacienda();
		var fact = this.facturaHacienda;
		console.log('fact reenviarMH',fact);
		console.log('factura', that.factura);
	    if (isNaN(Number(this.nuevoUsuario.cedula))){
			alert("Número de Cédula Incorrecta del Cliente " + this.selectedCita.nombreUserReserva + ' ' +
			    		this.selectedCita.primerApellidoUserReserva + ' ' +
			    	    this.selectedCita.segundoApellidoUserReserva);
		}else{
			that.enviandoMH = true;
			fact.conrealizada = true;
			that.genLetter(function(doc){
				var blob = doc.output("blob");
				that.blobToBase64(blob,function(base){
					fact.facturabase = {
						base: base
					};
					that.facturaService.post('',fact)
					.then(res => {
						console.log('res',res);
						if(res.respuesta == "aceptado"){
							that.factura.consecutivo = '';
							that.factura.clave = '';
							that.factura.estadoFactura = 'P';
							that.factura.xml = res.xml;
						    that.dataService.post('/factura/?method=put', {'factura':that.factura})
				             .then(response => {
				             //	that.obtieneCitasBarberia(that);
				             	alert('Información actualizada');
				             	that.enviandoMH = false;
				             	that.selectedCita.estadoFactura = 'P';
								that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita});
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estado = 'R';
				        	});
						} else if(res.error == "recibido"){
							//that.obtieneCitasBarberia(that);
							alert('Su factura fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Factura"');
							that.factura.refresh = res.refreshToken;
							that.factura.xml = res.xml;
							that.factura.estadoFactura = 'E';
							that.factura.base = base;

						    that.dataService.post('/factura/?method=put', {'factura':that.factura})
				             .then(response => {
				             	//alert('Información actualizada');
				            	that.enviandoMH = false;
				            	that.selectedCita.estadoFactura = 'E';
								that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita});
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estadoFactura = 'R';
				        	});
						} else if(res.respuesta == "rechazado"){
							that.enviandoMH = false;
							alert('Factura Rechazada por el Ministerio de Hacienda.');
							that.factura.refresh = res.refreshToken;
							that.factura.xml = res.xml;
							that.factura.estadoFactura = 'R';
							that.factura.base = base;

						    that.dataService.post('/factura/?method=put', {'factura':that.factura})
				             .then(response => {
				            	that.enviandoMH = false;
				            	that.selectedCita.estadoFactura = 'N';
								that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita});
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estadoFactura = 'R';
				        	});
						}else {
							alert('Lo sentimos pero su factura no fue aceptada por el Ministerio de Hacienda, por favor intentelo de nuevo.');
						}
					}, err =>{
						console.log('error',err);
						that.enviandoMH = false;
						// that.reenviarRefCompletar.hide();
					})
				});
			});
	    }
	}
		


	public async reenviarMH_Vieja(){
		var that = this;
		await this.facturacionHacienda();
		var fact = this.facturaHacienda;
		if (isNaN(Number(this.nuevoUsuario.cedula))){
			alert("Número de Cédula Incorrecta del Cliente " + this.selectedCita.nombreUserReserva + ' ' +
			    		this.selectedCita.primerApellidoUserReserva + ' ' +
			    	    this.selectedCita.segundoApellidoUserReserva);
		}else{
			that.enviandoMH = true;
			fact.conrealizada = true;
			that.genLetter(function(doc){
				var blob = doc.output("blob");
				that.blobToBase64(blob,function(base){
					fact.facturabase = {
						base: base
					};
					that.facturaService.post('',fact)
					.then(res => {
						console.log('res',res);
						if(res.respuesta == "aceptado"){
							console.log('that.selectedCita',that.selectedCita);
							that.selectedCita.estadoFactura = 'P';
							that.factura.estado = 'P';

					        that.dataService.post('/factura/?method=put', {'factura':that.selectedCita})
						   // that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita})
				             .then(response => {
				             	//that.obtieneCitasBarberia(that);
				             	alert('Información actualizada');
				             	that.enviandoMH = false;
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.selectedCita.estadoFactura = 'R';
				        	});
				            that.dataService.post('/factura/',{factura:that.factura})
					             .then(response => {
					             	alert('Factura Emitida Satisfactoriamente');
					             	that.enviandoMH = false;
					             	that.spinnerEmitiendoFactura = false;
					             	console.log(response);
					            },
					             error => {

					             	console.log('error');
					             	that.enviandoMH = false;
							 		that.selectedCita.estadoFactura = 'R';
							 		that.factura.estado =  'R';

							 		that.spinnerEmitiendoFactura = false;
					        });
						} else if(res.error == "recibido"){
							that.obtieneCitasBarberia(that);
							alert('Su factura fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Factura"');
							that.selectedCita.refresh = res.refreshToken;
							that.selectedCita.xml = res.xml;
							that.selectedCita.estadoFactura = 'E';

							that.factura.xml = res.refreshToken;
						    that.factura.refresh =  res.xml;
						    that.factura.estado =  'E';

						    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedCita})
				             .then(response => {
				             	alert('Información actualizada');
				            	that.enviandoMH = false;
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.selectedCita.estadoFactura = 'R';
				        	});

				            that.dataService.post('/factura/',{factura:that.factura})
				             .then(response => {
				             //	alert('Factura Emitida Satisfactoriamente');
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.selectedCita.estadoFactura = 'R';

						 		that.factura.estado =  'R';
						 		this.spinnerEmitiendoFactura = false;
				        	});
						} else {
							that.enviandoMH = false;
								alert('Factura Rechazada por el Ministerio de Hacienda, volver a intentar.');
						}
					}, err =>{
						console.log('error',err);
						that.enviandoMH = false;
						// that.reenviarRefCompletar.hide();
					})
				});
			});
		}

		fact.conrealizada = false;
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

	public obtenerDatosBarberia(){
		return this.dataService.get('/sucursal/'+ this.authService.loggedUser.idSucursal);
	}

	public obtenerDatosUsuario(idUsuario){
		return this.dataService.get('/usuario/'+ idUsuario);
	}



	public async facturacionHacienda(){
		var user = await this.obtenerDatosUsuario(this.selectedCita.idUsuarioBarbero);
		var barbero : Usuario = user.usuario;
		var that = this;
		console.log('barbero',barbero);

		console.log('nuevoUsuario',that.nuevoUsuario);
		that.facturaHacienda.factura  = {};
		that.facturaHacienda.cliente  = {};
		that.facturaHacienda.factura.emisor  = {};
		that.facturaHacienda.factura.receptor  = {};
		that.facturaHacienda.factura.detalles  = {};

		that.facturaHacienda.factura.fecha = that.formatDate(new Date());
		that.facturaHacienda.factura.nombreComercial = that.sucursal.nombreNegocio; //nombre barberia
		that.facturaHacienda.factura.situacion = 'normal';

		that.facturaHacienda.factura.emisor.nombre = barbero.nombre+ ' ' + barbero.apellido1 + ' ' +barbero.apellido2;// nombre del negocio
		that.facturaHacienda.factura.emisor.tipoId = '01';
		that.facturaHacienda.factura.emisor.id = barbero.cedula;
		that.facturaHacienda.factura.emisor.provincia = barbero.idProvincia;
		that.facturaHacienda.factura.emisor.canton = that.pad(barbero.idCanton,2,0);
		that.facturaHacienda.factura.emisor.distrito = that.pad(barbero.distrito,2,0);
		that.facturaHacienda.factura.emisor.barrio = '01';
		that.facturaHacienda.factura.emisor.senas = barbero.detalleDireccion;
		that.facturaHacienda.factura.emisor.codigoPaisTel = '506';
		that.facturaHacienda.factura.emisor.tel = barbero.telefono[0].telefono;
		that.facturaHacienda.factura.emisor.codigoPaisFax = '';
		that.facturaHacienda.factura.emisor.fax = '';
		that.facturaHacienda.factura.emisor.email = barbero.correo[0].correo;
		if(that.nuevoUsuario.nombre != 'generico' && (that.nuevoUsuario.cedula.length == 9  || that.nuevoUsuario.cedula.length == 10) && ((that.nuevoUsuario.nombre && that.nuevoUsuario.apellido1 && that.nuevoUsuario.apellido2) || that.nuevoUsuario.cedula)){
			that.facturaHacienda.factura.receptor.nombre = that.nuevoUsuario.nombre + that.nuevoUsuario.apellido1 + that.nuevoUsuario.apellido2;
			
			that.facturaHacienda.factura.receptor.tipoId = (that.nuevoUsuario.cedula.length==9) ? '01' : '02';
			
			if(!that.nuevoUsuario.cedula && that.nuevoUsuario.nombre && that.nuevoUsuario.apellido1 && that.nuevoUsuario.apellido2){
				var usuarios = await(that.sharedService.get('/api/personas?tipo=nombre&nombre='+that.nuevoUsuario.nombre+'&apellido1='+that.nuevoUsuario.apellido1+'&apellido2='+that.nuevoUsuario.apellido2));
				if(usuarios.persona[0].length == 1){
					that.nuevoUsuario.cedula == usuarios.persona[0].cedula;
				}
			}
			that.facturaHacienda.factura.receptor.id =  that.nuevoUsuario.cedula;
			if(that.nuevoUsuario.idProvincia && that.nuevoUsuario.idProvincia != 0){
				that.facturaHacienda.factura.receptor.provincia = that.nuevoUsuario.idProvincia;
			} else {
				that.facturaHacienda.factura.receptor.provincia = 1;
			}
			if(that.nuevoUsuario.idCanton && that.nuevoUsuario.idCanton != 0){
				that.facturaHacienda.factura.receptor.canton = that.pad(that.nuevoUsuario.idCanton,2,0);
			} else {
				that.facturaHacienda.factura.receptor.canton = '01';
			}
			if(that.nuevoUsuario.distrito && that.nuevoUsuario.distrito != '0'){
				that.facturaHacienda.factura.receptor.distrito = that.pad(that.nuevoUsuario.distrito,2,0);
			} else {
				that.facturaHacienda.factura.receptor.distrito = '01';
			}
			that.facturaHacienda.factura.receptor.barrio = '01';
			that.facturaHacienda.factura.receptor.senas = 'senas';
			that.facturaHacienda.factura.receptor.codigoPaisTel = '506';
			that.facturaHacienda.factura.receptor.tel =  that.nuevoUsuario.telefono[0].telefono;
			that.facturaHacienda.factura.receptor.codigoPaisFax = '';
			that.facturaHacienda.factura.receptor.fax = '';
			that.facturaHacienda.factura.receptor.email = this.nuevoUsuario.correo[0].correo;//'kimberlyporras@gmail.com';// 
			that.facturaHacienda.factura.omitirReceptor = 'false';
		} else {
			that.facturaHacienda.factura.omitirReceptor = 'true';
		}

		that.facturaHacienda.factura.condicionVenta = '01';// contado (01) - credito(02)
		that.facturaHacienda.factura.plazoCredito = '0';
		that.facturaHacienda.factura.medioPago = that.selectedCita.tipoPago;
		that.facturaHacienda.factura.codMoneda = 'CRC';
		that.facturaHacienda.factura.tipoCambio = '1';
		that.facturaHacienda.factura.totalServGravados = '0';
		that.facturaHacienda.factura.totalServExentos = that.selectedCita.precio;//total del servicio
		that.facturaHacienda.factura.totalMercGravada = '0';
		that.facturaHacienda.factura.totalMercExenta = '0';
		that.facturaHacienda.factura.totalGravados = '0';
		that.facturaHacienda.factura.totalExentos = that.selectedCita.precio;//total del servicio
		that.facturaHacienda.factura.totalVentas = that.selectedCita.precio;//total del servicio
		that.facturaHacienda.factura.totalDescuentos = '0';
		that.facturaHacienda.factura.totalVentasNeta = that.selectedCita.precio;//total del servicio
		that.facturaHacienda.factura.totalImpuestos = '0';
		that.facturaHacienda.factura.totalComprobante = that.selectedCita.precio;//total del servicio
		that.facturaHacienda.factura.otros = 'Gracias.';

		that.facturaHacienda.factura.detalles['1'] = {};
		that.facturaHacienda.factura.detalles['1'].cantidad = '1';
		that.facturaHacienda.factura.detalles['1'].unidadMedida = 'Sp';
		that.facturaHacienda.factura.detalles['1'].detalle = that.selectedCita.servicio;
		that.facturaHacienda.factura.detalles['1'].precioUnitario = that.selectedCita.precio;
		that.facturaHacienda.factura.detalles['1'].montoTotal = that.selectedCita.precio;
		that.facturaHacienda.factura.detalles['1'].subtotal = that.selectedCita.precio;
		that.facturaHacienda.factura.detalles['1'].montoTotalLinea = that.selectedCita.precio;

		that.facturaHacienda.factura.refreshToken = that.facturaHacienda.factura.refresh || '';
		that.facturaHacienda.factura.clave = that.facturaHacienda.factura.clave || '';
		that.facturaHacienda.factura.xml = that.facturaHacienda.factura.xml || '';
		that.facturaHacienda.factura.consecutivo = that.facturaHacienda.factura.consecutivo || '';

		that.facturaHacienda.cliente.id = barbero.idFacturador;
	
	}

	paseDate(date){
		var dd = date.getDate();
		var mm = date.getMonth()+1; //January is 0!

		var yyyy = date.getFullYear();
		if(dd<10){
		    dd='0'+dd;
		} 
		if(mm<10){
		    mm='0'+mm;
		} 
		var parsed = dd+'/'+mm+'/'+yyyy;
		return parsed;
	}

	truncate(str, limit) {
	    var bits, i;
	    bits = str.split('');
	    if (bits.length > limit) {
	        for (i = bits.length - 1; i > -1; --i) {
	            if (i > limit) {
	                bits.length = i;
	            }
	            else if (' ' === bits[i]) {
	                bits.length = i;
	                break;
	            }
	        }
	        bits.push('...');
	    }
	    return bits.join('');
	}






genLetter(cb,tipo = 0){
		var that = this;
		that.selectedProvincia = that.ubicacion[Number(that.sucursal.provincia) - 1];
		that.selectedCanton = that.selectedProvincia.cantones[Number(that.sucursal.idCanton) - 1];

		console.log('selectedCita',that.selectedCita);
		var doc;
		var img = new Image();
		img.addEventListener('load', function() {
			// header
			var pags = 1;
			var ancho = (that.authService.logoAncho && that.authService.logoAncho != 0) ? that.authService.logoAncho : 80;
			console.log('ancho',ancho);
			doc = new window.jsPDF('p','pt','letter');
			// var i = 0;
			// console.log('j',j,pags);
			var j = 0;
			//var temparray: Productofacturaitem[] = [],o,f,chunk = 32;
			//for (o=0,f=that.factura.productos.length; o<f; o+=chunk) {
			//	temparray = that.factura.productos.slice(o,o+chunk);
			//	console.log(temparray);
			// for (var j = 0 ; j < pags; j++) {
				console.log('looped',i,pags);
				doc.setFont("helvetica");
				doc.setFontType("bold");
				doc.setFontSize("12");
				var splitNombre = doc.splitTextToSize(that.sucursal.nombreNegocio, 300);
			    var altoHeader = 20;
			    doc.text(splitNombre, ancho+20, altoHeader);
			    if(splitNombre.length > 1){
			    	altoHeader = 16 * splitNombre.length;
			    }
				doc.text(that.selectedCita.cedulaBarbero, ancho+20, altoHeader + 15);
				doc.setFont("helvetica");
				doc.setFontType("normal");
				doc.setFontSize("8");
				doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, ancho+20, altoHeader + 30);
				doc.text('Tel. '+that.sucursal.telefono[0].telefono, ancho+20, altoHeader + 40);
				doc.text(that.sucursal.correo[0].correo, ancho+20, altoHeader + 50);
				//if(that.authService.loggedEmpresa.paginaWeb){
				//	doc.text(that.authService.loggedEmpresa.paginaWeb, ancho+20, altoHeader + 60);
				//}
				img.width = 80;
				img.height = 80;
			    doc.addImage(img, 'png', 25, 20);
			    // fin header
			    // numero factura
			 	doc.setFont("helvetica");
			    doc.setFontType("bold");
			    doc.setFontSize("10");
			    doc.text('Fecha', 25, 115);
			    doc.text(that.datePipe.transform(new Date(that.selectedCita.dia +': '+ that.selectedCita.horaInicial), 'dd/MM/yyyy hh:mm:ss '), 110, 115);
			    doc.text('Tipo Factura', 25, 130);
			    doc.text(('Contado'), 110, 130);
			    if(that.selectedCita.tipoPago == 'efectivo'){
			    	that.selectedCita.tipoPago = '01';
			    } else if(that.selectedCita.tipoPago == 'tarjeta'){
			    	that.selectedCita.tipoPago = '02';
			    } else if(that.selectedCita.tipoPago == 'transferencia'){
			    	that.selectedCita.tipoPago = '04';
			    } else {
			    	that.selectedCita.tipoPago = '01';
			    }
			    var medio = that.selectedCita.tipoPago || '01';
			    doc.text('Medio de Pago', 25, 145);
			    doc.text(that.tiposPago[Number(that.selectedCita.tipoPago) - 1], 110, 145);
			    doc.rect(300, 100, 280, 80);
			    doc.text('Cliente', 310, 115);
			  
			    if(tipo == 0 || tipo == 2 || tipo == 3 || tipo == 4){
				    doc.text('Doc. No', 25, 100);
				    var con = that.selectedCita.consecutivo || 'Sin consecutivo';
				    doc.text(con, 110, 100);
				    var posClave =  160;
				    doc.text('Clave Fiscal', 25, posClave);
				    var cla = that.selectedCita.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 160);
			    	doc.text(splitCla, 110, posClave);
				}
				
				if(tipo == 2){
					doc.setFont("helvetica");
				    doc.setFontType("normal");
				    doc.setFontSize("10");
				    doc.text('Documento Eliminado', 300, 55);
				    doc.text('Documento Original No', 300, 70);
				    var con = that.selectedCita.consecutivo || 'Sin consecutivo';
				    doc.text(con, 420, 70);
				    doc.text('Clave Fiscal Original', 300, 85);
				    var cla = that.selectedCita.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 150);
			    	doc.text(splitCla, 420, 85);
				}
				if(tipo == 3){
					doc.setFont("helvetica");
				    doc.setFontType("normal");
				    doc.setFontSize("10");
				    doc.text('Nota de Crédito', 300, 55);
				    doc.text('Documento Original No', 300, 70);
				    var con = that.selectedCita.consecutivo || 'Sin consecutivo';
				    doc.text(con, 420, 70);
				    doc.text('Clave Fiscal Original', 300, 85);
				    var cla = that.selectedCita.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 150);
			    	doc.text(splitCla, 420, 85);
				}
				if(tipo == 4){
					doc.setFont("helvetica");
				    doc.setFontType("normal");
				    doc.setFontSize("10");
				    doc.text('Nota de Debito', 300, 55);
				    doc.text('Documento Original No', 300, 70);
				    var con = that.selectedCita.consecutivo || 'Sin consecutivo';
				    doc.text(con, 420, 70);
				    doc.text('Clave Fiscal Original', 300, 85);
				    var cla = that.selectedCita.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 150);
			    	doc.text(splitCla, 420, 85);
				}
			    // fin numero factura
			    // cliente 
			    // doc.setFillColor(191,191,191);
			    doc.setFont("helvetica");
			    doc.setFontType("normal");
			    doc.setFontSize("10");
			    doc.text('Nombre', 310, 145);
			     if(that.selectedCita.nombreUserReserva != '' || that.selectedCita.nombreUserReserva != 'generico'){
					if(that.nuevoUsuario.cedula){
				    	doc.text('Cédula', 310, 130);
			    		doc.text(''+that.nuevoUsuario.cedula, 380, 130);
				    }

			    	var splitCliente = doc.splitTextToSize(that.selectedCita.nombreUserReserva + ' ' +
			    		that.selectedCita.primerApellidoUserReserva + ' ' +
			    	    that.selectedCita.segundoApellidoUserReserva, 180);
			    	doc.text(splitCliente, 380, 145);
			    } else {
			    	doc.text('Factura sin cliente', 380, 145);
			    }

			    // fin cliente
			    // tabla productos
			    doc.rect(25, 200, 560, 430);
			    doc.setFillColor(191,191,191);
			    doc.rect(26, 201, 558, 13, 'F');
			    var x = 26, y = 214;
			    for(var i=0; i<32;i++){
			    	if(i % 2 == 0){
			    		doc.setFillColor(204,217,255);
			    	} else {
			    		doc.setFillColor(255,255,255);
			    	}
			    	doc.rect(x, y, 558, 13, 'F');
			    	y += 13;
			    }
			    doc.setDrawColor(255,255,255);
			    doc.setLineWidth(1.5);
			    doc.line(240, 200, 240, 700);
				doc.line(350, 200, 350, 700);
				//doc.line(280, 200, 280, 700);
				//doc.line(330, 200, 330, 700);
				
				doc.line(460, 200, 460, 700);
			    doc.setFontSize("8");
			    doc.text('Producto', 47, 210, 'center');
			   // doc.text('Producto', 200, 210);
			    doc.text('Cantidad', 280, 210), 'center';
			   // doc.text('Descuento', 345, 210);
			    doc.text('Precio und', 400, 210, 'center');
			    doc.text('Precio', 520, 210, 'center');
			    // fin tabla productos
			    // agregar productos
			    y = 223;
			//	for (var i = temparray.length - 1; i >= 0; i--) {
			//		doc.text(''+temparray[i].producto.codigo, 60, y, 'center');
			//		if(temparray[i].producto.codigo != '0000'){
			//			var text = ''+temparray[i].producto.nombre+' '+temparray[i].producto.marca;
			//			doc.text(that.truncate(text,36), 110, y);
			//		} else {
			//			doc.text(''+temparray[i].producto.nombre, 110, y);
			//		}
			//		doc.text(''+temparray[i].cantidad, 310, y, 'right');
			//		doc.text(that.toDecimals(that.descuentoPorProducto(temparray[i])), 380, y, 'right');
			//		doc.text(that.toDecimals(temparray[i].producto.precio.toFixed(2)), 460, y, 'right');
			//		doc.text(that.toDecimals(Number(temparray[i].producto.precio.toFixed(2)) * temparray[i].cantidad), 550, y, 'right');
			//		y += 13;
			//	}

				doc.text(''+that.selectedCita.servicio, 45, y, 'left');
				doc.text('1', 300, y, 'right');
			//	doc.text(that.toDecimals(0), 380, y, 'right');
				doc.text(that.toDecimals(that.selectedCita.precio), 450, y, 'right');
				doc.text(that.toDecimals(that.selectedCita.precio), 575, y, 'right');

			    // fin agregar productos
			    // total
			    if(that.sucursal.pieFactura){
				    var splitTitle = doc.splitTextToSize(that.sucursal.pieFactura, 200);
					doc.text(splitTitle, 35, 670);
				}
			//	var moneda = that.factura.moneda || 'CRC'; 
			    doc.setFontSize("10");
				doc.setFontType("bold");
			    doc.text('Total Bruto', 370, 670);
			    doc.setFontType("normal");
			    doc.text(that.toDecimals(that.selectedCita.precio), 560, 670, 'right');
			     doc.text('Total Neto', 370, 690);
			    doc.text(that.toDecimals(that.selectedCita.precio), 560, 690, 'right');
			    doc.setFontSize("11");
				doc.setFontType("bold");
			    doc.text('Total Factura', 370, 710);
			    doc.text(that.toDecimals(that.selectedCita.precio), 560, 710, 'right');
			    doc.text('Pag. '+(j+1)+' de '+ pags, 540, 15);
			 //   if(that.factura.moneda == "USD"){
			//		doc.text('Tipo de cambio: ', 390, 770);
			//		doc.text(that.toDecimals(that.factura.tipoCambio), 560, 770, 'right');
			//	}
			  //  if(j < pags - 1){
			  //  	doc.addPage();
			  //  }
			//    j++;
		//	}
		    // fin total
		    cb(doc);
		});
		var imgName = that.authService.logoEmpresa || 'kyr.jpg';
		img.src = 'assets/' + imgName;
	}



	genLetter1(cb){
		var that = this;
		var doc;
		var img = new Image();
		console.log('suc',that.sucursal);
		that.selectedProvincia = that.ubicacion[Number(that.sucursal.provincia) - 1];
		that.selectedCanton = that.selectedProvincia.cantones[Number(that.sucursal.idCanton) - 1];
		img.addEventListener('load', function() {
			// header
			// var pags = Math.ceil(that.factura.items.length / 32); -> se usa en caso de tener mas de un item
			var pags = 1;
			console.log(window.jsPDF);
			doc = new window.jsPDF('p','pt','letter');
			// var i = 0;
			// console.log('j',j,pags);
			var j = 0;
			var o,f,temparray,chunk = 32;
			for (o=0,f=1; o<f; o+=chunk) {
				// temparray = that.factura.items.slice(o,o+chunk);
				// console.log(temparray);
			// for (var j = 0 ; j < pags; j++) {
				console.log('looped',i,pags);
				doc.setFont("helvetica");
				doc.setFontType("bold");
				doc.setFontSize("12");
				doc.text(that.sucursal.nombreNegocio, 100, 20);
				doc.setFont("helvetica");
				doc.setFontType("normal");
				doc.setFontSize("8");
				doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, 100, 35);
				doc.text('Tel. '+that.sucursal.telefono[0].telefono, 100, 45);
				doc.text(that.sucursal.correo[0].correo, 100, 55);
				// if(that.sucursal.paginaWeb){ --> si la barberia tiene pagina web
				// 	doc.text(that.sucursal.paginaWeb, 100, 65);
				// }
				img.width = 80;
				img.height = 80;
			    doc.addImage(img, 'png', 25, 10);
			    // fin header
			    // numero factura
			    doc.setFont("helvetica");
				doc.setFontType("bold");
				doc.setFontSize("12");
			    doc.text('Factura No', 25, 120);
			    var con = that.selectedCita.consecutivo || 'Sin consecutivo';
			    doc.text(con, 100, 120);
			    doc.text('Fecha', 25, 140);
			    doc.text(that.selectedCita.dia +': '+ that.selectedCita.horaInicial, 100, 140);
			    // fin numero factura
			    // cliente 
			    // doc.setFillColor(191,191,191);
				doc.rect(300, 100, 250, 58);
				doc.text('Cliente', 310, 115);
			    doc.setFont("helvetica");
				doc.setFontType("normal");
				doc.setFontSize("10");
			    doc.text('Nombre', 310, 130);
			    if(that.selectedCita.nombreUserReserva != '' || that.selectedCita.nombreUserReserva != 'generico'){
			    	doc.text(that.selectedCita.nombreUserReserva + ' ' +
			    			that.selectedCita.primerApellidoUserReserva + ' ' +
			    			that.selectedCita.segundoApellidoUserReserva, 380, 130);
			    	if(that.selectedCita.cedula){
				    	doc.text('Cedula', 310, 145);
				    	doc.text(''+that.selectedCita.cedula, 380, 145);
				    }
			    } else {
			    	doc.text('Factura sin cliente', 380, 130);
			    }
			    // fin cliente
			    // tabla productos
			    doc.rect(25, 200, 560, 430);
			    doc.setFillColor(191,191,191);
			    doc.rect(26, 201, 558, 13, 'F');
			    var x = 26, y = 214;
			    for(var i=0; i<32;i++){
			    	if(i % 2 == 0){
			    		doc.setFillColor(204,217,255);
			    	} else {
			    		doc.setFillColor(255,255,255);
			    	}
			    	doc.rect(x, y, 558, 13, 'F');
			    	y += 13;
			    }
			    doc.setDrawColor(255,255,255);
			    doc.setLineWidth(1.5);
				doc.line(280, 200, 280, 700);
				doc.line(330, 200, 330, 700);
				doc.line(400, 200, 400, 700);
				doc.line(480, 200, 480, 700);
			    doc.setFontSize("8");
			    doc.text('Detalle', 47, 210);
			    doc.text('Cantidad', 290, 210);
			    doc.text('Descuento', 345, 210);
			    doc.text('Precio und', 420, 210);
			    doc.text('Precio', 520, 210);
			    // fin tabla productos
			    // agregar productos
			    y = 223;
				// for (var i = temparray.length - 1; i >= 0; i--) {
					doc.text(''+that.selectedCita.servicio, 45, y, 'left');
					doc.text('1', 310, y, 'right');
					doc.text(that.toDecimals(0), 380, y, 'right');
					doc.text(that.toDecimals(that.selectedCita.precio), 460, y, 'right');
					doc.text(that.toDecimals(that.selectedCita.precio), 550, y, 'right');
					y += 13;
				// }
			    // fin agregar productos
			    // total
			    if(that.sucursal.pieFactura){
				    console.log('split text',that.sucursal.pieFactura);
				    var splitTitle = doc.splitTextToSize(that.sucursal.pieFactura, 200);
					doc.text(splitTitle, 35, 670);
				}
				// var splitTitle = doc.splitTextToSize("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", 200);
				// doc.text(splitTitle, 35, 670);
			    doc.setFontSize("10");
				doc.setFontType("bold");
			    doc.text('Total Bruto', 400, 670);
			    doc.setFontType("normal");
			    doc.text(that.toDecimals(that.selectedCita.precio), 560, 670, 'right');
			    doc.text('Descuento', 400, 690);
			    doc.text(that.toDecimals(0), 560, 690, 'right');
			    doc.text('Total Neto', 400, 710);
			    doc.text(that.toDecimals(that.selectedCita.precio), 560, 710, 'right');
			    doc.text('Impuestos', 400, 730);
			    doc.text(that.toDecimals(0), 560, 730, 'right');
			    doc.setFontSize("11");
				doc.setFontType("bold");
			    doc.text('Total Factura', 400, 750);
			    doc.text(that.toDecimals(that.selectedCita.precio), 560, 750, 'right');
			    doc.text('Pag. '+(j+1)+' de '+ pags, 540, 15);
			    if(j < pags - 1){
			    	doc.addPage();
			    }
			    j++;
			}
		    // fin total
		    cb(doc);
		});
		var imgName = this.sucursal.logoName || 'kyr.jpg';
		img.src = 'assets/' + imgName;
	}


	blobToBase64(blob, cb) {
	    var reader = new FileReader();
	    reader.onload = function() {
		    var dataUrl = reader.result;
		    var base64 = dataUrl.split(',')[1];
		    cb(base64);
	    };
	    reader.readAsDataURL(blob);
	}

	public calculaTotalItem(fi){
		return fi.precioUnitario * fi.cantidad - fi.montoDescuento + ((fi.precioUnitario * fi.cantidad - fi.montoDescuento )* fi.impuestos / 100);
	}

	descuentoPorProducto(productoItem){
		var totalDescuento = productoItem.montoDescuento * productoItem.cantidad;
		return totalDescuento;
	}

	dottedLine(doc, xFrom, yFrom, xTo, yTo, segmentLength){
	    // Calculate line length (c)
	    var a = Math.abs(xTo - xFrom);
	    var b = Math.abs(yTo - yFrom);
	    var c = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));

	    // Make sure we have an odd number of line segments (drawn or blank)
	    // to fit it nicely
	    var fractions = c / segmentLength;
	    var adjustedSegmentLength = (Math.floor(fractions) % 2 === 0) ? (c / Math.ceil(fractions)) : (c / Math.floor(fractions));

	    // Calculate x, y deltas per segment
	    var deltaX = adjustedSegmentLength * (a / c);
	    var deltaY = adjustedSegmentLength * (b / c);

	    var curX = xFrom, curY = yFrom;
	    while (curX <= xTo && curY <= yTo)
	    {
	        doc.line(curX, curY, curX + deltaX, curY + deltaY);
	        curX += 2*deltaX;
	        curY += 2*deltaY;
	    }
	}

	toDecimals(num){
		return this.decimalPipe.transform(num,'1.2-2');
	}

	formatDate(date:Date){
		return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss-06:00')
	}

	pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
	

	async imprimir(tipo){
		// console.log('imprimir',tipo,this.cita.items.length);
		var doc;
		var that = this;
		if(tipo == 'A4'){
			that.genLetter(that.printDoc);
		} else {
			var height = 60;
			var user = await that.obtenerDatosUsuario(that.selectedCita.idUsuarioBarbero);
			var barbero : Usuario = user.usuario;
			console.log(that.sucursal);
			that.selectedProvincia = that.ubicacion[Number(that.sucursal.provincia) - 1];
			that.selectedCanton = that.selectedProvincia.cantones[Number(that.sucursal.idCanton) - 1];
			height += 1 * 4;
			doc = new window.jsPDF('p','mm',[60,height]);
			doc.setFontSize("10");
			doc.setFontType("bold");
			doc.text(that.sucursal.nombreNegocio, 30, 8,"center");
			doc.setFontSize("7");
			doc.setFontType("normal");
			doc.text(that.selectedCita.consecutivo, 30, 12,"center");
			doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, 30, 16,"center");
			doc.text('Tel. '+that.sucursal.telefono[0].telefono, 30, 20,"center");
			doc.text(that.sucursal.correo[0].correo, 30, 24,"center");
			// if(that.factura.vendedor.paginaWeb){
			// 	doc.text(that.factura.vendedor.paginaWeb, 30, 28,"center");
			// } else {
				doc.text('www.lospeluqueros.com', 30, 28,"center");
			// }
			doc.text(barbero.cedula, 30, 32,"center");
			doc.text('Barbero:', 7, 36,"left");
			doc.text(barbero.nombre+ ' ' + barbero.apellido1 + ' ' +barbero.apellido2, 30, 36,"left");
			//display products
			var y = 43;
			// for (var i = that.factura.items.length - 1; i >= 0; i--) {
			// 	if(that.factura.items[i].detalle != '0000'){
			// 		var text = ''+that.factura.items[i].detalle;
			// 		doc.text(that.truncate(text,14), 7, y,'left');
			// 	} else {
					doc.text(''+that.selectedCita.servicio, 7, y,'left');
			// 	}
				doc.text(that.toDecimals(that.selectedCita.precio), 50, y, 'right');
				y += 4;
			// }
			// end display
			// total
			doc.text('-------------------------------------------------------------', 30, y,"center");
			doc.text('Total Neto: ', 35, y+4,"right");
			doc.text(that.toDecimals(that.selectedCita.precio), 50, y+4,"right");
			doc.text('Total Impuestos: ', 35, y+8,"right");
			doc.text(that.toDecimals(that.selectedCita.precio), 50, y+8,"right");
			doc.text('Total: ', 35,y+12,"right");
			doc.text(that.toDecimals(that.selectedCita.precio), 50, y+12,"right");
			// fin total
			doc.setFontSize("8");
			doc.text('Muchas Gracias', 30,y+19,"center");
			that.printDoc(doc);
			// doc.save('pdv.pdf')
		}
	}

	printDoc(doc){
		var blob = doc.output("blob");
		window.open(URL.createObjectURL(blob));
	}

	public seleccionaUsuarioCita(usuario){
		this.selectedCita.usuarioCita = usuario;
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

	toTitleCase(str) {
	    return str.replace(/\w\S*/g, function(txt){
	        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	}

	openNuevo(){
		this.nuevoUsuario = new Usuario(); 
		this.nuevoUsuarioDisplay = !this.nuevoUsuarioDisplay;
	}

	newUser(){
		this.nuevoUsuario.contrasenna = 'clave';
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario);
		if(this.usuarioErrores.length == 0){
			this.cargando = true;
			this.authService.nuevoUsuarioNoLogin(this.nuevoUsuario);
			let sub = this.authService.loggedObservable.subscribe(value => {
				this.cargando = false;
				this.usuarioCita = [];
			    if(value){
			    	this.selectedCita.usuarioCita = value;
			    	this.nuevoUsuarioDisplay = false;
			    	// this.updateReserva();
			    }
			    sub.unsubscribe();
			});
		}
	}



	public updateDate(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
				pausas[i].horaInicialFormat = pausas[i].dia + ' ' +  pausas[i].horaInicial.substring(0, 2) + ':' + pausas[i].horaInicial.substring(3, 5);
	
		}
		return pausas;
	}



public buscaClienteChanged = _.debounce(function() {
	var that = this;
	this.busquedaXNom = true;
	if(that.buscaCliente.length >= 3){
       			 var obtenerCitas = function(i){
            		let barberoCita = { barbero: null, citas : []};
            		that.dataService.get('/reserva/?idUsuarioReserva='+that.buscaCliente+'&idSucursal='+that.authService.loggedUser.idSucursal)
			            .then(response => {
			               that.clienteCitas = that.updateDate(response.reserva);
			        	   that.cargando = false;
			            },
			            error => {

							console.log('error');
			            });
            	}
            	obtenerCitas(0);
	    }else{
	    	this.busquedaXNom = false;
	    } 
	}, 1000);
 
}
