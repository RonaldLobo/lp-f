import { Component, OnInit ,TemplateRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { FacturaService } from '../services/factura.service';
import { WindowRefService } from '../services/window.service';
import { ValidatorService } from '../services/validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Usuario } from '../models/usuario';
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';



@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
	public modalRef: BsModalRef;
	public displayCitas: boolean = false;
	public correosUsuarioDisplay :any = [];
	public telefonosUsuarioDisplay :any = [];
	public correosBarberoDisplay :any = [];
	public telefonosBarberoDisplay :any = [];
	public Object : any = Object;

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

	public nuevoUsuario:Usuario = new Usuario();
	public usuarioErrores : any = [];

	public validationError: boolean = false;
	public nuevoTelefono: number;
	public nuevoCorreo:string;		

	public validationErrorMsg: string = '';	
	public selectedCita:any={};
	public selectedDateNoFormat: string = '';
	public today= new Date();	
	public facturaHacienda : any = {};


    constructor(
    		private modalService: BsModalService,
    		public authService:AuthService, 
    		private validatorService:ValidatorService,
    		private dataService:DataService, 
    		private windowRef: WindowRefService, 
    		private facturaService:FacturaService
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
		    if(that.authService.isAdminSucursalUser()){
		    	//that.obtieneCitasBarberia(that);
		    }

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
		console.log('is admin',this.authService.isAdminSucursalUser());
		if(this.authService.isAdminSucursalUser()){
			console.log(this.selectedBarbero);
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
		this.mostrarModificar = true;
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





	public async updateReserva(){
		// await this.facturacionHacienda();
		// console.log('facturaHacienda',this.facturaHacienda);
		// this.facturaService.post('',this.facturaHacienda)
		//     .then(response => {
		//     	console.log(response);
		//     	 if (response.respuesta == 'rechazado'){
 	// 					alert('Factura Rechazada por el Ministerio de Hacienda, volver a intentar.');
		//     	 }else{
				
			 	    this.selectedCita.estadoFactura = 'P';
				    this.dataService.post('/reserva/?method=put', {'reserva':this.selectedCita})
		             .then(response => {
		             	alert('Información actualizada');
		               // alert('Factura Generada');
		             	this.cargando = false;
		             	console.log(response);
		            },
		             error => {
		             	// alert('Factura Generada | Error al actualizar el estado. ' + error);
		             	this.cargando = false;
				 		this.selectedCita.estadoFactura = 'R';
		        	});
		    	 // }
		    
				  
		 	 // },
	    //     error => {
	    //     	console.log('error',error);
	    //         this.cargando = false;
	    // });
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



	public async facturacionHacienda(){
		var sucursal = await this.obtenerDatosBarberia();
		console.log('suc',sucursal);
		this.sucursal = sucursal[0];
		this.facturaHacienda.factura  = {};
		this.facturaHacienda.cliente  = {};
		this.facturaHacienda.factura.emisor  = {};
		this.facturaHacienda.factura.receptor  = {};
		this.facturaHacienda.factura.detalles  = {};

		this.facturaHacienda.factura.fecha = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();
		this.facturaHacienda.factura.nombreComercial = this.sucursal.nombreNegocio; //nombre barberia
		this.facturaHacienda.factura.situacion = 'normal';



		this.facturaHacienda.factura.emisor.nombre = this.sucursal.descripcion;// nombre del negocio
		this.facturaHacienda.factura.emisor.tipoId = '02';
		this.facturaHacienda.factura.emisor.id = this.sucursal.cedulaJuridica;
		this.facturaHacienda.factura.emisor.provincia = this.sucursal.provincia;
		this.facturaHacienda.factura.emisor.canton = this.sucursal.idCanton;
		this.facturaHacienda.factura.emisor.distrito = this.sucursal.distrito;
		this.facturaHacienda.factura.emisor.barrio = this.sucursal.barrio;
		this.facturaHacienda.factura.emisor.senas = this.sucursal.detalleDireccion;
		this.facturaHacienda.factura.emisor.codigoPaisTel = '506';
		this.facturaHacienda.factura.emisor.tel = this.sucursal.telefono[0].telefono;
		this.facturaHacienda.factura.emisor.codigoPaisFax = '';
		this.facturaHacienda.factura.emisor.fax = '';
		this.facturaHacienda.factura.emisor.email = this.sucursal.correo[0].correo;

		this.facturaHacienda.factura.receptor.nombre =   this.nuevoUsuario.nombre;
		this.facturaHacienda.factura.receptor.tipoId = '01';
		this.facturaHacienda.factura.receptor.id =  this.nuevoUsuario.usuario;
		this.facturaHacienda.factura.receptor.provincia = '';//cedula juridica
		this.facturaHacienda.factura.receptor.canton = '';//cedula juridica
		this.facturaHacienda.factura.receptor.distrito = '';//cedula juridica
		this.facturaHacienda.factura.receptor.barrio = '';//cedula juridica
		this.facturaHacienda.factura.receptor.senas = '';//cedula juridica
		this.facturaHacienda.factura.receptor.codigoPaisTel = '506';
		this.facturaHacienda.factura.receptor.tel =  this.nuevoUsuario.telefono[0].telefono;
		this.facturaHacienda.factura.receptor.codigoPaisFax = '';
		this.facturaHacienda.factura.receptor.fax = '';
		this.facturaHacienda.factura.receptor.email = this.nuevoUsuario.correo[0].correo;

		this.facturaHacienda.factura.condicionVenta = '01';
		this.facturaHacienda.factura.plazoCredito = '0';
		this.facturaHacienda.factura.medioPago = '01';
		this.facturaHacienda.factura.codMoneda = 'CRC';
		this.facturaHacienda.factura.tipoCambio = '1';
		this.facturaHacienda.factura.totalServGravados = '0';
		this.facturaHacienda.factura.totalServExentos = this.selectedCita.precio;//total del servicio
		this.facturaHacienda.factura.totalMercGravada = '0';
		this.facturaHacienda.factura.totalMercExenta = '0';
		this.facturaHacienda.factura.totalGravados = '0';
		this.facturaHacienda.factura.totalExentos = this.selectedCita.precio;//total del servicio
		this.facturaHacienda.factura.totalVentas = this.selectedCita.precio;//total del servicio
		this.facturaHacienda.factura.totalDescuentos = '0';
		this.facturaHacienda.factura.totalVentasNeta = this.selectedCita.precio;//total del servicio
		this.facturaHacienda.factura.totalImpuestos = 'normal';
		this.facturaHacienda.factura.totalComprobante = this.selectedCita.precio;//total del servicio
		this.facturaHacienda.factura.otros = 'Gracias.';

		this.facturaHacienda.factura.detalles['1'] = {};
		this.facturaHacienda.factura.detalles['1'].cantidad = '1';
		this.facturaHacienda.factura.detalles['1'].unidadMedida = 'Sp.';
		this.facturaHacienda.factura.detalles['1'].detalle = this.selectedCita.servicio;
		this.facturaHacienda.factura.detalles['1'].precioUnitario = this.selectedCita.precio;
		this.facturaHacienda.factura.detalles['1'].montoTotal = this.selectedCita.precio;
		this.facturaHacienda.factura.detalles['1'].subtotal = this.selectedCita.precio;
		this.facturaHacienda.factura.detalles['1'].montoTotalLinea = this.selectedCita.precio;


		this.facturaHacienda.factura.omitirReceptor = 'false';


		this.facturaHacienda.cliente.id = this.sucursal.idFacturaAPI; // "5b79d789cd22f43682adeada";//
	
	}
	



 
}
