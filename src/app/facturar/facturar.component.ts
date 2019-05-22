
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';  
import { Usuario } from "../models/usuario";
import { DataService } from '../services/data.service';
import { SharedService } from '../services/shared.service';
import * as _ from "lodash";
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { WindowRefService } from '../services/window.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../services/auth.service';
import { ValidatorService } from "../services/validator.service"; 
import { Telefono } from '../models/telefono';
import { Correo } from '../models/correo';

import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FacturaService } from '../services/factura.service';


declare var window;


@Component({
  selector: 'app-facturar',
  templateUrl: './facturar.component.html',
  styleUrls: ['./facturar.component.css']
})
export class FacturarComponent implements OnInit {
	public modalRef: BsModalRef;
	public cargando: boolean = false;
	public buscar: boolean = false;
	public buscaUsuario:string = "";
	public buscaCedula:string = "";
	public buscaProducto:string = "";
	public buscaCodigo:string = "";
	public usuarioCita: any = [];
	public productos: any = [];
	public selectedFactura:any={};
	public detalleFactura: any = [];
	public factura: any = {};
	public sucursal: any = [];
    p: number = 1;
    public selectedDate : any = new Date();
    public reservas: any = [];
    public today= new Date();	
    public cantidadProducto: number = 1;
    public cantProdNoReg : number = 1;
    public precioProdNoReg : number = 0;
	public impuestoProdNoReg : number = 0;
	public detalleProdNoReg : string = "";
	public razonDescProdNoReg : string = "";
	public descuentoProdNoReg : number = 0;
	public totalNet : number = 0;
	public totalDesc : number = 0;
	public totalImp : number = 0;
	public totalGeneral : number = 0;
	public tipoDescuento : string = "";
	public tipoTransferencia : string = "01";
	public moneda : string = "C";
	public detalle : string = "";
	public codigoFactura : string = "";
	public validationError : boolean = false;
	public numComprobante : string = "";
	public facturaHacienda : any = {};
	public objReserva : any = {};
	public objUsuarioCita : any = [];
 	public enviandoMH: boolean = false;
 	public ubicacion : any = {};
	public selectedProvincia : any = {};
 	public selectedCanton : any = {};
 	public contFecha : number = 1;
	public clienteSeleccionado: any = {};

	public mostrarFactura: boolean = false;
 	public nuevoUsuario:Usuario = new Usuario();
 	public usuarioErrores : any = [];
	public posiblesClientes : any = [];
	public provincias : any = [];
	public encontroUsuario: boolean = false;
	public nuevoCorreo:string;
	public fecha : Date = new Date();
	public fechaNacimiento : Date = new Date();
	public nuevoTelefono: number;
	public validationErrorMsg: string = '';
	public nuevoUsuarioError: boolean = false;
	public seleccionarProvincia : any = {};
 	public seleccionarCanton : any = {};
 	public tipoNota : string = '';
	public printRefCompletar: BsModalRef;



	constructor(
		private router:Router,
		private dataService:DataService, 
		public authService:AuthService, 
		public validatorService:ValidatorService,
		public sharedService:SharedService,
		private modalService: BsModalService,
		private facturaService:FacturaService,
    	private decimalPipe:DecimalPipe,
		private datePipe:DatePipe
	) { }


	ngOnInit() {
		var that = this;


		setTimeout(function(){

			that.buscar = false;
			that.obtenerDatosBarberia().then((data) => {
				that.sucursal = data[0];
			});

			that.sharedService.get('/api/ubicacion').then((data) => {
		        that.ubicacion = data.ubicacion;
		        that.cargando = false;
			},(error)=>{
				console.log('error',error);
			});

				that.sharedService.get("/api/ubicacion").then((data) =>{
	  			that.provincias = data.ubicacion;
	  			that.seleccionarProvincia = that.provincias[0];
	  			that.seleccionarCanton = that.seleccionarProvincia.cantones[0];
	  			that.nuevoUsuario.distrito = that.seleccionarCanton.distritos[0].codigo;
	  		});
		},2000);
	  }



	public updateTimeToHora(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
			pausas[i].horaInicialFormat = Number(pausas[i].horaInicial.substring(0, 2) + pausas[i].horaInicial.substring(3, 5));
		}
		return pausas;
	}

	public zerofill(i,add) {
		i = i + add;
    	return ((i < 10 ? '0' : '') + i);
	}


	public buscaUsuarioChanged = _.debounce(function() {
		this.encontroUsuario = false;
		if(this.buscaUsuario.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/usuario/?nombre='+this.buscaUsuario)
	        .then(response => {
	            console.log('success usuarios',response);
	            this.usuarioCita = response.usuario;
	            this.objUsuarioCita = this.usuarioCita;
	            console.log('buscaUsuarioChanged objUsuarioCita',this.objUsuarioCita);
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaUsuario){
	    	this.usuarioCita = [];
	    }
	}, 400);


	public buscaProductoChanged = _.debounce(function() {
		this.encontroProducto = false;
		if(this.buscaProducto.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/inventario/?producto='+this.buscaProducto+'&idSucursal='+this.authService.loggedUser.idSucursal)
	        .then(response => {
	            this.productos = response.inventario;
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaProducto){
	    	this.productos = [];
	    }
	}, 400);


	public buscaCodigoChanged = _.debounce(function() {
		this.encontroProducto = false;
		if(this.buscaCodigo.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/inventario/?codigo='+this.buscaCodigo+'&idSucursal='+this.authService.loggedUser.idSucursal)
	        .then(response => {
	        	this.productos = response.inventario;
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaCodigo){
	    	this.productos = [];
	    }
	}, 400);

	public seleccionaProducto(producto){
		producto.servicio = producto.producto;
		producto.cantidad = this.cantidadProducto;
		var totalPrd = this.totalProducto(producto);
		if (totalPrd==0){ totalPrd = producto.costo}
		producto.total = totalPrd;
		this.totalGeneral = this.totalGeneral + totalPrd;
		producto.idServicio = null;
		producto.razonDescuento = '';
		producto.precio = producto.costo;

		this.detalleFactura.push(producto);
		this.totalImp = this.totalImpuestos();
		this.totalDesc = this.totalDescuentos();
		this.totalNet = this.totalVentasNeto();
		this.cargarFactura();
		
		this.factura.idCliente = 0;
		
		this.productos = [];
		this.cantidadProducto = 1;
		this.buscaCodigo = '';
		this.buscaProducto = '';

	}

	public seleccionaUsuarioCita(reserva){

		console.log('kim reserva',reserva);
		reserva.impuesto = 0;
		reserva.descuento = 0;
		reserva.impuesto = 0;
		reserva.cantidad = 1;
		reserva.tipoDescuento = 'C';
		reserva.total = reserva.precio;
		reserva.producto = reserva.servicio;
		reserva.codigo = '';
		reserva.razonDescuento = '';
		this.totalGeneral = this.totalGeneral + Number(reserva.precio);
		reserva.unidad = 'Sp';

		this.detalleFactura.push(reserva);
		this.totalImp = this.totalImpuestos();
		this.totalDesc = this.totalDescuentos();
		this.totalNet = this.totalVentasNeto();
		this.cargarFactura();
		this.factura.idCliente = reserva.idUsuarioReserva;
		this.factura.idCreadoPor = reserva.idUsuarioBarbero;
		this.objReserva = reserva;
		this.reservas = [];

	}

	public changeDateCita(event){
		var that = this;
		setTimeout(function(){
			if (that.contFecha > 2){
				that.cargando = true;
	       		 that.dataService.get('/reserva/?idSucursal='+that.authService.loggedUser.idSucursal+'&fecha='+ event)
	            .then(response => {
	                that.reservas = response.reserva;
	                that.cargando = false;
	            },
	            error => {
	            });
			} 
			that.contFecha += 1;
        },2000);
	}


	public agregarProducto(){
		var objProductoNoReg : any = {};
		objProductoNoReg.cantidad = this.cantProdNoReg;
		objProductoNoReg.precio = this.precioProdNoReg;
		objProductoNoReg.impuesto = this.impuestoProdNoReg;
		objProductoNoReg.servicio = this.detalleProdNoReg;
		objProductoNoReg.razonDescuento = this.razonDescProdNoReg;
		objProductoNoReg.descuento = this.descuentoProdNoReg;
		objProductoNoReg.idServicio = null;
	    var totalPrd = this.totalProducto(objProductoNoReg);
		if (totalPrd==0){ totalPrd = objProductoNoReg.costo}
		objProductoNoReg.total = totalPrd;
		this.detalleFactura.push(objProductoNoReg); 

		this.totalGeneral = this.totalGeneral + Number(objProductoNoReg.precio);
		this.totalImp = this.totalImpuestos();
		this.totalDesc = this.totalDescuentos();
		this.cantProdNoReg = 1;
		this.precioProdNoReg = 0;
		this.impuestoProdNoReg = 0;
		this.descuentoProdNoReg = 0;
		this.detalleFactura = "";
		this.razonDescProdNoReg = "";
		this.cargarFactura();
	}


	cargarFactura(){
		this.factura.totalImpuesto = this.totalImp;
		this.factura.totalNeto = this.totalNet;
		this.factura.totalDescuento = this.totalDesc;
		this.factura.total = this.totalGeneral;
		this.factura.fecha = this.formatDate(this.today);
		this.factura.moneda = this.moneda;
		this.factura.tipoTransaccion = this.tipoTransferencia;
		this.factura.detalle = this.detalle;
		this.factura.estado = "R";
		this.factura.codigo = this.codigoFactura;
		this.factura.numComprobante = this.numComprobante;
		this.factura.idSucursal = this.authService.loggedUser.idSucursal;
		if (this.factura.idCliente == ''){
			this.factura.idCliente = null;
		}
		if (this.factura.idCreadoPor == ''){
			this.factura.idCreadoPor = this.authService.loggedUser.id;
		}
	}

	

	formatDate(date:Date){
		return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss-06:00')
	}

	formatDateShort(date:Date){
		return this.datePipe.transform(date, 'yyyy-MM-dd')
	}

	formatTime(date:Date){
		return this.datePipe.transform(date, 'HH:mm:ss')
	}

//*********************************************************************************************************************************
//										CALCULOS 
//*********************************************************************************************************************************

	totalServiciosGravados(){
		var total = 0;
		for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
			if(this.detalleFactura[i].unidad == 'Sp' && this.detalleFactura[i].impuestos){
				total += this.detalleFactura[i].cantidad * this.detalleFactura[i].precio;
			}
		}
		return total;
	}

	totalServiciosExcentos(){
		var total = 0;
		for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
		if(this.detalleFactura[i].unidad == 'Sp' && this.detalleFactura[i].impuesto == 0){
				total += this.detalleFactura[i].cantidad * this.detalleFactura[i].precio;
			}
		}
		return total;
	}

	totalMercaderiaGravada(){
		var total = 0;
		for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
			if(this.detalleFactura[i].unidad != 'Sp' && this.detalleFactura[i].impuesto){
				total += this.detalleFactura[i].cantidad * this.detalleFactura[i].precio;
			}
		}
		return total;
	}

	totalMercaderiaExcenta(){
		var total = 0;
		for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
			if(this.detalleFactura[i].unidad != 'Sp' && this.detalleFactura[i].impuestos == 0){
				total += this.detalleFactura[i].cantidad * this.detalleFactura[i].precio;
			}
		}
		return total;
	}

	public totalImpuestos(){
		var tot = 0;
		console.log(this.detalleFactura);
		for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
			//	console.log('precio',this.detalleFactura[i].precio , 'cantidad',this.detalleFactura[i].cantidad,'descuento x prod',this.descuentoPorProducto(this.detalleFactura[i]),'impuestos',this.detalleFactura[i].impuesto);
			tot += (this.detalleFactura[i].precio * this.detalleFactura[i].cantidad - this.descuentoPorProducto(this.detalleFactura[i])) * this.detalleFactura[i].impuesto / 100;
			
		}
		return tot;
	}

	totalProducto(producto){

		console.log('cantidad',producto.cantidad );
		console.log('descuentoPorProducto',this.descuentoPorProducto(producto) );
		console.log('impuesto',producto.impuesto );
		console.log('impuesto',producto.costo );
		var tot = 0;
		tot =  Number(producto.costo) * producto.cantidad  + ((producto.costo * producto.cantidad - this.descuentoPorProducto(producto)) * producto.impuesto / 100);
		return tot;
	}

	public totalDescuentos(){
		var tot = 0;
		for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
			tot += this.descuentoPorProducto(this.detalleFactura[i]);
		}
		return tot;
	}


	totalComprobante(){
		return this.totalVentasNeto() + this.totalImpuestos();
	}

	totalVentas(){
		return this.totalMercaderiaGravada() + this.totalServiciosGravados() + this.totalServiciosExcentos() + this.totalMercaderiaExcenta()
	}

	totalVentasNeto(){
		return this.totalVentas() - this.totalDescuentos();
	}

	descuentoPorProducto(productoItem){
		var totalDescuento = 0;
		if(productoItem.tipoDescuento == 'C') {
			totalDescuento += productoItem.descuento * productoItem.cantidad;
		} else {
			totalDescuento += (productoItem.precio * productoItem.cantidad) *  (productoItem.descuento * 0.01);
		}
		return totalDescuento;
	}




//*********************************************************************************************************************************
//													FIN DE CALCULOS
//*********************************************************************************************************************************

//*********************************************************************************************************************************
//													GENERAR FACTURAS
//*********************************************************************************************************************************


//public agregarFactura(){
//		this.cargarFactura();
//		this.factura.detalleFactura =[...this.detalleFactura];
//		console.log('factura',this.factura);

//		this.facturacionHacienda();

		//this.dataService.post('/factura/',{factura:this.factura})
        //    .then(response => {
        //    	alert('Factura Registrada');
        //    	this.cargando = false;
        //    },
        //    error => {
        //    	this.cargando = false;
        //});
        
//	}

	public async agregarFactura(){
		await this.facturacionHacienda();
		this.factura.detalleFactura =[...this.detalleFactura];
		console.log('factura',this.factura);
		console.log('factura hacienda',this.facturaHacienda);
		var fact = this.facturaHacienda;
		var that = this;
		fact.con = true;
		that.cargando = true;
		that.enviandoMH = true;
		console.log(fact);
		that.facturaService.post('',fact)
		.then(res => {
			console.log('res',res);
			fact.con = false;
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
							that.factura.estado= 'P';
						   	that.dataService.post('/factura/',{factura:that.factura})
				             .then(response => {
				             	alert('Factura Emitida Satisfactoriamente');
				             	that.enviandoMH = false;
				             	that.cargando = false;
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estado = 'R';
						 		that.cargando = false;
				        	});
						} else if(res.error == "recibido"){
							alert('Su factura fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Factura"');
							that.factura.refresh = res.refreshToken;
							that.factura.xml = res.xml;
							that.factura.estado = 'E';
							that.factura.base = base;
						    that.dataService.post('/factura/',{factura:that.factura})
				             .then(response => {
				             	alert('Información actualizada');
				            	that.enviandoMH = false;
				            	that.cargando = false;
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estado = 'R';
						 		that.cargando = false;
				        	});
						} else {
							that.enviandoMH = false;
						 	that.factura.estado = 'R';
						 	 that.dataService.post('/factura/',{factura:that.factura})
				             .then(response => {
				            	that.enviandoMH = false;
				            	that.cargando = false;
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estado = 'R';
						 		that.cargando = false;
				        	});
 							alert('Factura Rechazada por el Ministerio de Hacienda, volver a intentar.');
 							that.cargando = false;
						}
					}, err =>{
						console.log('error',err);
						that.enviandoMH = false;
						that.cargando = false;
					})


				});
		    });
		}, err =>{
			console.log('error',err);
			that.enviandoMH = false;
			that.cargando = false;
		});
	
	}




	public obtenerDatosUsuario(idUsuario){
		return this.dataService.get('/usuario/'+ idUsuario);
	}

	pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }



	public async facturacionHacienda(){
		var userCita;
		var creadoPor;
        if (!this.factura){
        	creadoPor = this.authService.loggedUser.id

        }else{

        	creadoPor = this.factura.idCreadoPor;
        }

		console.log('creadoPor',creadoPor)
		var user = await this.obtenerDatosUsuario(creadoPor);


		console.log('idCliente',this.factura.idCliente, 'clienteSeleccionado', this.clienteSeleccionado);
   		if (!this.clienteSeleccionado.cedula)
		{
			userCita = await this.obtenerDatosUsuario(this.factura.idCliente);
		} else{
		 	userCita = {usuario:this.clienteSeleccionado};
		}
		var barbero : Usuario = user.usuario;
		var usuarioCita : Usuario = userCita.usuario;


		console.log('objUsuarioCita',userCita.usuario);

		this.objUsuarioCita = usuarioCita;
		this.facturaHacienda.factura  = {};
		this.facturaHacienda.cliente  = {};
		this.facturaHacienda.factura.emisor  = {};
		this.facturaHacienda.factura.receptor  = {};
		this.facturaHacienda.factura.detalles  = {};

		this.facturaHacienda.factura.fecha = this.formatDate(new Date());
		this.facturaHacienda.factura.nombreComercial = this.objReserva.sucursal; //nombre barberia
		this.facturaHacienda.factura.situacion = 'normal';

		this.facturaHacienda.factura.emisor.nombre = barbero.nombre+ ' ' + barbero.apellido1 + ' ' +barbero.apellido2;// nombre del negocio
		this.facturaHacienda.factura.emisor.tipoId = '01';
		this.facturaHacienda.factura.emisor.id = barbero.cedula;
		this.facturaHacienda.factura.emisor.provincia = barbero.idProvincia;
		this.facturaHacienda.factura.emisor.canton = this.pad(barbero.idCanton,2,0);
		this.facturaHacienda.factura.emisor.distrito = this.pad(barbero.distrito,2,0);
		this.facturaHacienda.factura.emisor.barrio = '01';
		this.facturaHacienda.factura.emisor.senas = barbero.detalleDireccion;
		this.facturaHacienda.factura.emisor.codigoPaisTel = '506';
		this.facturaHacienda.factura.emisor.tel = barbero.telefono[0].telefono;
		this.facturaHacienda.factura.emisor.codigoPaisFax = '';
		this.facturaHacienda.factura.emisor.fax = '';
		this.facturaHacienda.factura.emisor.email = barbero.correo[0].correo;

		console.log('cedula', usuarioCita, 'barbero', barbero);
  	
		if(userCita.nombre != 'generico' && (usuarioCita.cedula.length == 9  || usuarioCita.cedula.length == 10)  && ((barbero.nombre && barbero.apellido1 && barbero.apellido2) || barbero.cedula)){
			this.facturaHacienda.factura.receptor.nombre = userCita.usuario.nombre + ' ' + userCita.usuario.apellido1 + ' ' +userCita.usuario.apellido2;
			
			this.facturaHacienda.factura.receptor.tipoId = userCita.usuario.tipoCedula; //(usuarioCita.cedula.length==9) ? '01' : '02';

		//	if(!this.objReserva.cedulaBarbero && this.objReserva.nombreBarbero && this.objReserva.primerApellidoBarbero && this.objReserva.segundoApellidoBarbero){
		//		var usuarios = await(this.sharedService.get('/api/personas?tipo=nombre&nombre='+this.objReserva.nombreBarbero+'&apellido1='+this.objReserva.primerApellidoBarbero+'&apellido2='+this.objReserva.segundoApellidoBarbero));
		//		if(usuarios.persona[0].length == 1){
		//			this.objReserva.CedulaUserReserva == usuarios.persona[0].cedula;
		//		}
		//	}



			this.facturaHacienda.factura.receptor.id = userCita.usuario.cedula;
			if(this.usuarioCita.idProvincia && this.usuarioCita.idProvincia != 0){
				this.facturaHacienda.factura.receptor.provincia = this.usuarioCita.idProvincia;
			} else {
				this.facturaHacienda.factura.receptor.provincia = 1;
			}
			if(this.usuarioCita.idCanton && this.usuarioCita.idCanton != 0){
				this.facturaHacienda.factura.receptor.canton = this.pad(this.usuarioCita.idCanton,2,0);
			} else {
				this.facturaHacienda.factura.receptor.canton = '01';
			}
			if(this.usuarioCita.distrito && this.usuarioCita.distrito != '0'){
				this.facturaHacienda.factura.receptor.distrito = this.pad(this.usuarioCita.distrito,2,0);
			} else {
				this.facturaHacienda.factura.receptor.distrito = '01';
			}
			this.facturaHacienda.factura.receptor.barrio = '01';
			this.facturaHacienda.factura.receptor.senas = 'senas';
			this.facturaHacienda.factura.receptor.codigoPaisTel = '506';

			this.facturaHacienda.factura.receptor.tel =  userCita.usuario.telefono[0].telefono;
			this.facturaHacienda.factura.receptor.codigoPaisFax = '';
			this.facturaHacienda.factura.receptor.fax = '';
			this.facturaHacienda.factura.receptor.email = userCita.usuario.correo[0].correo;
			this.facturaHacienda.factura.omitirReceptor = 'false';
		} else {
			this.facturaHacienda.factura.omitirReceptor = 'true';
		}

		this.facturaHacienda.factura.condicionVenta = '01';
		this.facturaHacienda.factura.plazoCredito = '0';
		this.facturaHacienda.factura.medioPago = '01';
		this.facturaHacienda.factura.codMoneda = 'CRC';
		this.facturaHacienda.factura.tipoCambio = '1';
		this.facturaHacienda.factura.totalServGravados = '0';
		this.facturaHacienda.factura.totalServExentos = this.factura.total;
		this.facturaHacienda.factura.totalMercGravada = '0';
		this.facturaHacienda.factura.totalMercExenta = '0';
		this.facturaHacienda.factura.totalGravados = '0';
		this.facturaHacienda.factura.totalExentos = this.factura.total;
		this.facturaHacienda.factura.totalVentas = this.factura.total;
		this.facturaHacienda.factura.totalDescuentos = this.factura.totalDescuento;
		this.facturaHacienda.factura.totalVentasNeta = this.factura.totalNeto ;
		this.facturaHacienda.factura.totalImpuestos = 	this.factura.totalImpuesto ;
		this.facturaHacienda.factura.totalComprobante = this.factura.total;
		this.facturaHacienda.factura.otros = 'Gracias.';

	  console.log('detalleFactura',this.detalleFactura);
		for (var i = 0; i < this.detalleFactura.length; i++) {
			this.facturaHacienda.factura.detalles[''+(i + 1)] = {};
			this.facturaHacienda.factura.detalles[''+(i + 1)].cantidad = this.detalleFactura[i].cantidad;
			this.facturaHacienda.factura.detalles[''+(i + 1)].unidadMedida = this.detalleFactura[i].unidad;
			this.facturaHacienda.factura.detalles[''+(i + 1)].detalle = this.detalleFactura[i].detalle || 'Cita';
			this.facturaHacienda.factura.detalles[''+(i + 1)].precioUnitario = Number(this.detalleFactura[i].precio).toFixed(2);
			this.facturaHacienda.factura.detalles[''+(i + 1)].montoTotal = Number(this.detalleFactura[i].total).toFixed(2);
			this.facturaHacienda.factura.detalles[''+(i + 1)].subtotal = Number(this.detalleFactura[i].cantidad * this.detalleFactura[i].precio - this.descuentoPorProducto(this.detalleFactura[i])).toFixed(2);
			this.facturaHacienda.factura.detalles[''+(i + 1)].montoTotalLinea = Number(((this.detalleFactura[i].cantidad * this.detalleFactura[i].precio - this.descuentoPorProducto(this.detalleFactura[i]) + ((this.detalleFactura[i].cantidad * this.detalleFactura[i].precio - this.descuentoPorProducto(this.detalleFactura[i])) * this.detalleFactura[i].impuesto / 100))).toFixed(2));
			this.facturaHacienda.factura.detalles[''+(i + 1)].naturalezaDescuento = this.detalleFactura[i].razonDescuento;
				
		}
	
		this.facturaHacienda.factura.refreshToken = this.facturaHacienda.factura.refresh || '';
		this.facturaHacienda.factura.clave = this.facturaHacienda.factura.clave || '';
		this.facturaHacienda.factura.xml = this.facturaHacienda.factura.xml || '';
		this.facturaHacienda.factura.consecutivo = this.facturaHacienda.factura.consecutivo || '';

		this.facturaHacienda.cliente.id = barbero.idFacturador;

		console.log('hacienda',this.facturaHacienda);
	
	}





	public async reenviarMH(){
		var that = this;
		await this.facturacionHacienda();
		var fact = this.facturaHacienda;
		console.log('fact reenviarMH',fact);
		console.log('factura', that.factura);

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
					    that.dataService.post('/factura/?method=put', {'factura':that.factura})
			             .then(response => {
			             //	that.obtieneCitasBarberia(that);
			             	alert('Información actualizada');
			             	that.enviandoMH = false;
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
			             	alert('Información actualizada');
			            	that.enviandoMH = false;
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
			             	alert('Información actualizada');
			            	that.enviandoMH = false;
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
		


	

	blobToBase64(blob, cb) {
	    var reader = new FileReader();
	    reader.onload = function() {
		    var dataUrl = reader.result;
		    var base64 = dataUrl.split(',')[1];
		    cb(base64);
	    };
	    reader.readAsDataURL(blob);
	}


	public obtenerDatosBarberia(){
		return this.dataService.get('/sucursal/'+ this.authService.loggedUser.idSucursal);
	}

	toDecimals(num){
		return this.decimalPipe.transform(num,'1.2-2');
	}

	
	printDoc(doc){
		var blob = doc.output("blob");
		window.open(URL.createObjectURL(blob));
	}


//*********************************************************************************************************************************
//													FIN GENERAR FACTURAS
//*********************************************************************************************************************************


//*********************************************************************************************************************************
//													CREAR CLIENTE
//*********************************************************************************************************************************




  public newUser(){
		this.nuevoUsuario.contrasenna = 'clave';
		this.nuevoUsuario.fechaNacimiento = this.fechaNacimiento;
		this.nuevoUsuario.idProvincia = this.seleccionarProvincia.codigo ;
		this.nuevoUsuario.idCanton = this.seleccionarCanton.codigo ;
		this.nuevoUsuario.barrio = '01';
		this.usuarioErrores = this.validatorService.validaUsuario(this.nuevoUsuario);
		if(this.usuarioErrores.length == 0){
			this.cargando = true;
			this.authService.nuevoUsuarioNoLogin(this.nuevoUsuario);
			let sub = this.authService.loggedObservable.subscribe(value => {
				this.cargando = false;
				if(this.router.url === '/clientes'){
				    if(value){
				    	this.clienteSeleccionado = this.nuevoUsuario;
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
		this.nuevoUsuario.fechaNacimiento = this.fechaNacimiento;
		this.nuevoUsuario.idProvincia = this.seleccionarProvincia.codigo ;
		this.nuevoUsuario.idCanton = this.seleccionarCanton.codigo ;
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
	                this.fechaNacimiento = new Date();
	            },
	            error => {
	            	this.cargando = false;
	        });
        }
	}

	public buscaClienteChanged = _.debounce(function() {
		this.encontroUsuario = false;
		this.nuevoUsuario =  new Usuario();
		if(this.buscaUsuario.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/usuario/?nombre='+this.buscaUsuario)
	        .then(response => {
	            this.usuarioCita = response.usuario;
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaUsuario){
	    	this.usuarioCita = [];
	    }
	}, 400);

	public seleccionaCliente(usuario){
		this.nuevoUsuario = usuario;
		this.seleccionarProvincia = this.provincias[Number(this.nuevoUsuario.idProvincia) - 1];
		this.seleccionarCanton = this.seleccionarProvincia.cantones[Number(this.nuevoUsuario.idCanton) - 1];
		this.encontroUsuario=true;
		this.usuarioCita = [];
		this.fechaNacimiento= new Date(this.nuevoUsuario.fechaNacimiento);
		this.clienteSeleccionado = usuario;

	}



  	public fechaChanges(param){
  		var date = this.fecha.getFullYear()+'-'+this.zerofill(this.fecha.getMonth(),1)+'-'+this.zerofill(this.fecha.getDate() ,0);
  		if(date != param){
			this.fecha = new Date(param.replace(/-/g, '\/'));
		}
	}

	public fechaNacimientoChanges(param){
  		console.log('fechaNacimiento',param);
  		var date = this.fechaNacimiento.getFullYear()+'-'+this.zerofill(this.fechaNacimiento.getMonth(),1)+'-'+this.zerofill(this.fechaNacimiento.getDate() ,0);
  		if(date != param){
			this.fechaNacimiento = new Date(param.replace(/-/g, '\/'));
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
				this.seleccionarProvincia = this.provincias[Number(this.nuevoUsuario.idProvincia) - 1];
				this.seleccionarCanton = this.seleccionarProvincia.cantones[Number(this.nuevoUsuario.idCanton) - 1];
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
				this.seleccionarProvincia = this.provincias[Number(this.nuevoUsuario.idProvincia) - 1];
				this.seleccionarCanton = this.seleccionarProvincia.cantones[Number(this.nuevoUsuario.idCanton) - 1];
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



//*********************************************************************************************************************************
//													FIN CREAR CLIENTE
//*********************************************************************************************************************************




//*********************************************************************************************************************************
//													IMPRIMIR FACTURA
//*********************************************************************************************************************************

	openModalPrint(template: TemplateRef<any>) {
		this.printRefCompletar = this.modalService.show(template);
	}


	//public openModalPrint(template: TemplateRef<any>) {
	//	this.modalRef = this.modalService.show(template);
	//}


	public mostrarFacturas(factura){
		this.selectedFactura = factura;
		this.mostrarFactura = true;
	}

	async genLetter(cb){
		var that = this;
		var doc;
		var img = new Image();
	

		var userCita;
		userCita = await this.obtenerDatosUsuario(this.factura.idCliente);
	    var usuarioCita : Usuario = userCita.usuario;
		



		that.selectedProvincia = that.ubicacion[Number(that.sucursal.provincia) - 1];
		that.selectedCanton = that.selectedProvincia.cantones[Number(that.sucursal.idCanton) - 1];
		img.addEventListener('load', function() {
		
			var pags = 1;
			console.log(window.jsPDF);
			doc = new window.jsPDF('p','pt','letter');
			var j = 0;
			var o,f,temparray,chunk = 32;
			for (o=0,f=1; o<f; o+=chunk) {
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
			
				img.width = 80;
				img.height = 80;
			    doc.addImage(img, 'png', 25, 10);
			    // fin header
			    // numero factura
			    doc.setFont("helvetica");
				doc.setFontType("bold");
				doc.setFontSize("12");
			    doc.text('Factura No', 25, 120);
			    var con = that.factura.consecutivo || 'Sin consecutivo';
			    doc.text(con, 100, 120);
			    doc.text('Fecha', 25, 140);
			    doc.text(that.formatDateShort(that.today) +': '+ that.formatTime(that.today), 100, 140);
			    doc.text('Clave Fiscal', 25, 180);
			    doc.text(that.factura.clave, 110, 180);
			    // fin numero factura
			    // cliente 
			    // doc.setFillColor(191,191,191);
				doc.rect(300, 100, 250, 58);
				doc.text('Cliente', 310, 115);
			    doc.setFont("helvetica");
				doc.setFontType("normal");
				doc.setFontSize("10");
			    doc.text('Nombre', 310, 130);

			    console.log('usuarioCita',usuarioCita);
			    if (usuarioCita){

			    console.log('kim1',usuarioCita);
			    }else{

			    console.log('kim2',usuarioCita);
			    }

			    if(usuarioCita.nombre != 'generico' && usuarioCita){//usuarioCita.nombre != '' || 
			    	doc.text(usuarioCita.nombre + ' ' +
			    			usuarioCita.apellido1 + ' ' +
			    			usuarioCita.apellido2, 380, 130);
			    	if(usuarioCita.cedula){
				    	doc.text('Cedula', 310, 145);
				    	doc.text(''+usuarioCita.cedula, 380, 145);
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
			    console.log('detalleFactura',that.detalleFactura);
				 for (var i = that.detalleFactura.length - 1; i >= 0; i--) {
					doc.text(''+that.detalleFactura[i].servicio, 45, y, 'left');
					doc.text(''+that.detalleFactura[i].cantidad, 310, y, 'right');
					doc.text(''+that.toDecimals(that.detalleFactura[i].descuento), 380, y, 'right');
					doc.text(''+that.toDecimals(that.detalleFactura[i].precio), 460, y, 'right');
					doc.text(''+that.toDecimals(that.detalleFactura[i].total), 550, y, 'right');
					y += 13;
				 }
			    // fin agregar productos
			    // total
			    if(that.sucursal.pieFactura){
				    console.log('split text',that.sucursal.pieFactura);
				    var splitTitle = doc.splitTextToSize(that.sucursal.pieFactura, 200);
					doc.text(splitTitle, 35, 670);
				}
				// var splitTitle = doc.splitTextToSize("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", 200);
				// doc.text(splitTitle, 35, 670);

			    console.log('factura',that.factura);
			    doc.setFontSize("10");
				doc.setFontType("bold");
			    doc.text('Total Bruto', 400, 670);
			    doc.setFontType("normal");
			    doc.text(''+that.toDecimals(that.factura.total), 560, 670, 'right');
			    doc.text('Descuento', 400, 690);
			    doc.text(that.toDecimals(0), 560, 690, 'right');
			    doc.text('Total Neto', 400, 710);
			    doc.text(''+that.toDecimals(that.factura.totalNeto), 560, 710, 'right');
			    doc.text('Impuestos', 400, 730);
			    doc.text(''+that.toDecimals(that.factura.totalImpuesto), 560, 730, 'right');
			    doc.setFontSize("11");
				doc.setFontType("bold");
			    doc.text('Total Factura', 400, 750);
			    doc.text(''+that.toDecimals(that.factura.total), 560, 750, 'right');
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
// ----------------------------------------------------------------------------------------------------------------
//											IMPRIMIR FACTURA EN PUNTO DE VENTA
// ----------------------------------------------------------------------------------------------------------------

async imprimir(tipo){
		var creadoPor;
		var doc;
		var that = this;
        if (that.factura){
        	creadoPor = that.authService.loggedUser.id;
        }else{
        	creadoPor = that.factura.idCreadoPor;
        }
		
		if(tipo == 'A4'){
			this.genLetter(that.printDoc);
		} else {
			var height = 60;
			var user = await this.obtenerDatosUsuario(creadoPor);
			var barbero : Usuario = user.usuario;
			that.selectedProvincia = that.ubicacion[Number(this.sucursal.provincia) - 1];
			that.selectedCanton = that.selectedProvincia.cantones[Number(this.sucursal.idCanton) - 1];
			height += 1 * 4;
			doc = new window.jsPDF('p','mm',[60,height]);
			doc.setFontSize("10");
			doc.setFontType("bold");
			doc.text(this.sucursal.nombreNegocio, 30, 8,"center");
			doc.setFontSize("7");
			doc.setFontType("normal");
			//doc.text(that.selectedCita.consecutivo, 30, 12,"center");  preguntar amor
			doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, 30, 16,"center");
			doc.text('Tel. '+this.sucursal.telefono[0].telefono, 30, 20,"center");
			doc.text(this.sucursal.correo[0].correo, 30, 24,"center");
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
			console.log('that.detalleFactura',that.detalleFactura);

			for (var i = this.detalleFactura.length - 1; i >= 0; i--) {
				doc.text(''+that.detalleFactura[i].servicio, 7, y,'left');
				doc.text(that.toDecimals(that.detalleFactura[i].total), 50, y, 'right');
				y += 4;
			}

			doc.text('-------------------------------------------------------------', 30, y,"center");
			doc.text('Total Neto: ', 35, y+4,"right");
			doc.text(that.toDecimals(that.factura.totalNeto), 50, y+4,"right");
			doc.text('Total Impuestos: ', 35, y+8,"right");
			doc.text(that.toDecimals(that.factura.totalImpuesto), 50, y+8,"right");
			doc.text('Total: ', 35,y+12,"right");
			doc.text(that.toDecimals(that.factura.total), 50, y+12,"right");
			// fin total
			doc.setFontSize("8");
			doc.text('Muchas Gracias', 30,y+19,"center");
			that.printDoc(doc);
		}
	}


//*********************************************************************************************************************************
//													FIN IMPRIMIR FACTURA
//*********************************************************************************************************************************
}
