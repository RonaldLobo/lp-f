import { Component, OnInit ,TemplateRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { Usuario } from '../models/usuario';
import { SharedService } from '../services/shared.service';
import { FacturaService } from '../services/factura.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';


import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';

declare var window;

@Component({
	selector: 'app-factura',
	templateUrl: './factura.component.html',
	styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit {
	public facturas: any = [];
	public idSucursal: string = '';
	public mostrarFactura: boolean = false;
	public selectedFactura:any={};
	public selectedProvincia : any = {};
 	public selectedCanton : any = {};
	public modalRef: BsModalRef;
	public printRefCompletar: BsModalRef;
	public sucursal: any = {};
	public facturaHacienda : any = {};
	public enviandoMH: boolean = false;
	public nuevoUsuario:Usuario = new Usuario();
    p: number = 1;
	constructor(private dataService:DataService,
		public authService:AuthService,
		private modalService: BsModalService, 
		private sharedService: SharedService, 
		private decimalPipe:DecimalPipe,
		private facturaService:FacturaService,
		private datePipe:DatePipe) { 
	}


	public openModal(template: TemplateRef<any>) {
		this.modalRef = this.modalService.show(template);
	}


	openModalPrint(template: TemplateRef<any>) {
		this.printRefCompletar = this.modalService.show(template);
	}

	ngOnInit() {

		var that = this;
		setTimeout(function(){
			that.dataService.get('/reserva?idSucursal='+that.authService.loggedUser.idSucursal+'&estadoFactura=P')
			.then(response => {
				console.log(response.reserva);
				that.facturas = that.updateTimeToHora(response.reserva);
			},
			error => {
			});
			that.sharedService.get('/api/ubicacion').then((data) => {
		        that.selectedProvincia = data.ubicacion[Number(that.authService.loggedUser.idProvincia) - 1];
		        that.selectedCanton = that.selectedProvincia.cantones[Number(that.authService.loggedUser.idCanton) - 1];
			},(error)=>{
				console.log('error',error);
			});

			that.dataService.get('/sucursal/'+ that.authService.loggedUser.idSucursal).then((data) => {
		        that.sucursal = data[0];
			},(error)=>{
				console.log('error',error);
			});
		},2000);
	}

	public updateTimeToHora(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
			pausas[i].horaInicialFormat = Number(pausas[i].horaInicial.substring(0, 2) + pausas[i].horaInicial.substring(3, 5));
		}
		return pausas;
	}


	public cargarFactura(factura){
		this.selectedFactura = factura;
		this.mostrarFactura = true;
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

	// public imprimir(factura){
	// 	console.log(factura);
	// }

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

	genLetter(cb){
		var that = this;
		var doc;
		var img = new Image();
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
			    var con = that.selectedFactura.consecutivo || 'Sin consecutivo';
			    doc.text(con, 100, 120);
			    doc.text('Fecha', 25, 140);
			    doc.text(that.selectedFactura.dia +': '+ that.selectedFactura.horaInicial, 100, 140);
			    // fin numero factura
			    // cliente 
			    // doc.setFillColor(191,191,191);
				doc.rect(300, 100, 250, 58);
				doc.text('Cliente', 310, 115);
			    doc.setFont("helvetica");
				doc.setFontType("normal");
				doc.setFontSize("10");
			    doc.text('Nombre', 310, 130);
			    if(that.selectedFactura.nombreUserReserva != '' || that.selectedFactura.nombreUserReserva != 'generico'){
			    	doc.text(that.selectedFactura.nombreUserReserva + ' ' +
			    			that.selectedFactura.primerApellidoUserReserva + ' ' +
			    			that.selectedFactura.segundoApellidoUserReserva, 380, 130);
			    	if(that.selectedFactura.cedula){
				    	doc.text('Cedula', 310, 145);
				    	doc.text(''+that.selectedFactura.cedula, 380, 145);
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
					doc.text(''+that.selectedFactura.servicio, 45, y, 'left');
					doc.text('1', 310, y, 'right');
					doc.text(that.toDecimals(0), 380, y, 'right');
					doc.text(that.toDecimals(that.selectedFactura.precio), 460, y, 'right');
					doc.text(that.toDecimals(that.selectedFactura.precio), 550, y, 'right');
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
			    doc.text(that.toDecimals(that.selectedFactura.precio), 560, 670, 'right');
			    doc.text('Descuento', 400, 690);
			    doc.text(that.toDecimals(0), 560, 690, 'right');
			    doc.text('Total Neto', 400, 710);
			    doc.text(that.toDecimals(that.selectedFactura.precio), 560, 710, 'right');
			    doc.text('Impuestos', 400, 730);
			    doc.text(that.toDecimals(0), 560, 730, 'right');
			    doc.setFontSize("11");
				doc.setFontType("bold");
			    doc.text('Total Factura', 400, 750);
			    doc.text(that.toDecimals(that.selectedFactura.precio), 560, 750, 'right');
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

	imprimir(tipo){
		console.log('imprimir',tipo,this.selectedFactura);
		var doc;
		var that = this;
		if(tipo == 'A4'){
			this.genLetter(that.printDoc);
		} else {
			var height = 60;
			height += 4;
			doc = new window.jsPDF('p','mm',[60,height]);
			doc.setFontSize("10");
			doc.setFontType("bold");
			doc.text(that.sucursal.nombreNegocio, 30, 8,"center");
			doc.setFontSize("7");
			doc.setFontType("normal");
			var con = that.selectedFactura.consecutivo || 'Sin consecutivo';
			doc.text(con, 30, 12,"center");
			doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, 30, 16,"center");
			doc.text('Tel. '+that.sucursal.telefono[0].telefono, 30, 20,"center");
			doc.text(that.sucursal.correo[0].correo, 30, 24,"center");
			if(that.sucursal.paginaWeb){
				doc.text(that.sucursal.paginaWeb, 30, 28,"center");
			}
			if(that.sucursal.cedulaJuridica){
				doc.text(that.sucursal.cedulaJuridica, 30, 32,"center");
			}
			doc.text('Vendedor:', 7, 36,"left");
			doc.text(that.selectedFactura.nombreBarbero + ' ' + that.selectedFactura.primerApellidoBarbero +' '+ that.selectedFactura.segundoApellidoBarbero, 30, 36,"left");
			//display products

			var y = 43;
			// for (var i = that.factura.items.length - 1; i >= 0; i--) {
				// if(that.factura.items[i].detalle != '0000'){
					var text = ''+that.selectedFactura.servicio;
					doc.text(that.truncate(text,14), 7, y,'left');
				// } else {
				// 	doc.text(''+that.factura.items[i].detalle, 7, y,'left');
				// }
				doc.text(that.toDecimals(that.selectedFactura.precio), 50, y, 'right');
				y += 4;
			// }
			// end display
			// total
			doc.text('-------------------------------------------------------------', 30, y,"center");
			doc.text('Total Neto: ', 35, y+4,"right");
			doc.text(that.toDecimals(that.selectedFactura.precio), 50, y+4,"right");
			doc.text('Total Impuestos: ', 35, y+8,"right");
			doc.text(that.toDecimals(0), 50, y+8,"right");
			doc.text('Total: ', 35,y+12,"right");
			doc.text(that.toDecimals(that.selectedFactura.precio), 50, y+12,"right");
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

	public async obtenerInfoUsuario(id){
		this.dataService.get('/usuario/'+id)
		.then(response => {
	        this.nuevoUsuario = response.usuario;
	        this.reenviarMH();
        },
        error => {
        });
	}

	public async reenviarMH(){
		var that = this;
		await this.facturacionHacienda();
		var fact = this.facturaHacienda;
		console.log(fact);
		that.enviandoMH = true;
		fact.conrealizada = true;
		// that.openModalReenviar(temp);
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
						that.selectedFactura.consecutivo = '';
						that.selectedFactura.clave = '';
						that.selectedFactura.estadoFactura = 'P';
					    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedFactura})
			             .then(response => {
			             	alert('Información actualizada');
			             	that.enviandoMH = false;
			             	console.log(response);
			            },
			             error => {
			             	that.enviandoMH = false;
					 		that.selectedFactura.estadoFactura = 'R';
			        	});
					} else if(res.error == "recibido"){
						alert('Su factura fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Factura"');
						that.selectedFactura.refresh = res.refreshToken;
						that.selectedFactura.xml = res.xml;
						that.selectedFactura.estadoFactura = 'E';
					    that.dataService.post('/reserva/?method=put', {'reserva':that.selectedFactura})
			             .then(response => {
			             	alert('Información actualizada');
			            	that.enviandoMH = false;
			             	console.log(response);
			            },
			             error => {
			             	that.enviandoMH = false;
					 		that.selectedFactura.estadoFactura = 'R';
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
		
	public obtenerDatosBarberia(){
		return this.dataService.get('/sucursal/'+ this.authService.loggedUser.idSucursal);
	}



	public async facturacionHacienda(){
		var sucursal = await this.obtenerDatosBarberia();
		//console.log('suc',sucursal);
		this.sucursal = sucursal[0];
		this.facturaHacienda.factura  = {};
		this.facturaHacienda.cliente  = {};
		this.facturaHacienda.factura.emisor  = {};
		this.facturaHacienda.factura.receptor  = {};
		this.facturaHacienda.factura.detalles  = {};

		this.facturaHacienda.factura.fecha = this.formatDate(new Date());
		this.facturaHacienda.factura.nombreComercial = this.sucursal.nombreNegocio; //nombre barberia
		this.facturaHacienda.factura.situacion = 'normal';

		this.facturaHacienda.factura.emisor.nombre = this.sucursal.descripcion;// nombre del negocio
		this.facturaHacienda.factura.emisor.tipoId = this.sucursal.tipoId;
		this.facturaHacienda.factura.emisor.id = this.sucursal.cedulaJuridica;
		this.facturaHacienda.factura.emisor.provincia = this.sucursal.provincia;
		this.facturaHacienda.factura.emisor.canton = this.sucursal.canton;
		this.facturaHacienda.factura.emisor.distrito = this.sucursal.distrito;
		this.facturaHacienda.factura.emisor.barrio = this.sucursal.barrio;
		this.facturaHacienda.factura.emisor.senas = this.sucursal.detalleDireccion;
		this.facturaHacienda.factura.emisor.codigoPaisTel = '506';
		this.facturaHacienda.factura.emisor.tel = this.sucursal.telefono[0].telefono;
		this.facturaHacienda.factura.emisor.codigoPaisFax = '';
		this.facturaHacienda.factura.emisor.fax = '';
		this.facturaHacienda.factura.emisor.email = this.sucursal.correo[0].correo;
		if(this.nuevoUsuario.nombre != 'generico' && ((this.nuevoUsuario.nombre && this.nuevoUsuario.apellido1 && this.nuevoUsuario.apellido2) || this.nuevoUsuario.cedula)){
			this.facturaHacienda.factura.receptor.nombre = this.nuevoUsuario.nombre + this.nuevoUsuario.apellido1 + this.nuevoUsuario.apellido2;
			this.facturaHacienda.factura.receptor.tipoId = '01';
			if(!this.nuevoUsuario.cedula && this.nuevoUsuario.nombre && this.nuevoUsuario.apellido1 && this.nuevoUsuario.apellido2){
				var usuarios = await(this.sharedService.get('/api/personas?tipo=nombre&nombre='+this.nuevoUsuario.nombre+'&apellido1='+this.nuevoUsuario.apellido1+'&apellido2='+this.nuevoUsuario.apellido2));
				if(usuarios.persona[0].length == 1){
					this.nuevoUsuario.cedula == usuarios.persona[0].cedula;
				}
			}
			this.facturaHacienda.factura.receptor.id =  this.nuevoUsuario.cedula;
			this.facturaHacienda.factura.receptor.provincia = this.nuevoUsuario.idProvincia;
			this.facturaHacienda.factura.receptor.canton = this.nuevoUsuario.idCanton;
			this.facturaHacienda.factura.receptor.distrito = this.nuevoUsuario.distrito;
			this.facturaHacienda.factura.receptor.barrio = '01';
			this.facturaHacienda.factura.receptor.senas = 'senas';
			this.facturaHacienda.factura.receptor.codigoPaisTel = '506';
			this.facturaHacienda.factura.receptor.tel =  this.nuevoUsuario.telefono[0].telefono;
			this.facturaHacienda.factura.receptor.codigoPaisFax = '';
			this.facturaHacienda.factura.receptor.fax = '';
			this.facturaHacienda.factura.receptor.email = this.nuevoUsuario.correo[0].correo;
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
		this.facturaHacienda.factura.totalServExentos = this.selectedFactura.precio;//total del servicio
		this.facturaHacienda.factura.totalMercGravada = '0';
		this.facturaHacienda.factura.totalMercExenta = '0';
		this.facturaHacienda.factura.totalGravados = '0';
		this.facturaHacienda.factura.totalExentos = this.selectedFactura.precio;//total del servicio
		this.facturaHacienda.factura.totalVentas = this.selectedFactura.precio;//total del servicio
		this.facturaHacienda.factura.totalDescuentos = '0';
		this.facturaHacienda.factura.totalVentasNeta = this.selectedFactura.precio;//total del servicio
		this.facturaHacienda.factura.totalImpuestos = '0';
		this.facturaHacienda.factura.totalComprobante = this.selectedFactura.precio;//total del servicio
		this.facturaHacienda.factura.otros = 'Gracias.';

		this.facturaHacienda.factura.detalles['1'] = {};
		this.facturaHacienda.factura.detalles['1'].cantidad = '1';
		this.facturaHacienda.factura.detalles['1'].unidadMedida = 'Sp';
		this.facturaHacienda.factura.detalles['1'].detalle = this.selectedFactura.servicio;
		this.facturaHacienda.factura.detalles['1'].precioUnitario = this.selectedFactura.precio;
		this.facturaHacienda.factura.detalles['1'].montoTotal = this.selectedFactura.precio;
		this.facturaHacienda.factura.detalles['1'].subtotal = this.selectedFactura.precio;
		this.facturaHacienda.factura.detalles['1'].montoTotalLinea = this.selectedFactura.precio;

		this.facturaHacienda.factura.refreshToken = this.facturaHacienda.factura.refresh || '';
		this.facturaHacienda.factura.clave = this.facturaHacienda.factura.clave || '';
		this.facturaHacienda.factura.xml = this.facturaHacienda.factura.xml || '';
		this.facturaHacienda.factura.consecutivo = this.facturaHacienda.factura.consecutivo || '';

		this.facturaHacienda.cliente.id = this.sucursal.idFacturaAPI;
	
	}

		formatDate(date:Date){
		return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss-06:00')
	}

	// totalServiciosGravados(){
	// 	var total = 0;
	// 	for (var i = this.factura.items.length - 1; i >= 0; i--) {
	// 		if(this.factura.items[i].unidadMedida == 'Sp' && this.factura.items[i].impuestos){
	// 			total += this.factura.items[i].cantidad * this.factura.items[i].precioUnitario;
	// 		}
	// 	}
	// 	return total;
	// }

	// totalServiciosExcentos(){
	// 	var total = 0;
	// 	for (var i = this.factura.items.length - 1; i >= 0; i--) {
	// 		if(this.factura.items[i].unidadMedida == 'Sp' && this.factura.items[i].impuestos == 0){
	// 			total += this.factura.items[i].cantidad * this.factura.items[i].precioUnitario;
	// 		}
	// 	}
	// 	return total;
	// }

	// totalMercaderiaGravada(){
	// 	var total = 0;
	// 	for (var i = this.factura.items.length - 1; i >= 0; i--) {
	// 		if(this.factura.items[i].unidadMedida != 'Sp' && this.factura.items[i].impuestos){
	// 			total += this.factura.items[i].cantidad * this.factura.items[i].precioUnitario;
	// 		}
	// 	}
	// 	return total;
	// }

	// totalMercaderiaExcenta(){
	// 	var total = 0;
	// 	for (var i = this.factura.items.length - 1; i >= 0; i--) {
	// 		if(this.factura.items[i].unidadMedida != 'Sp' && this.factura.items[i].impuestos == 0){
	// 			total += this.factura.items[i].cantidad * this.factura.items[i].precioUnitario;
	// 		}
	// 	}
	// 	return total;
	// }

	// public totalImpuestos(){
	// 	var tot = 0;
	// 	for (var i = this.factura.items.length - 1; i >= 0; i--) {
	// 		tot += (this.factura.items[i].precioUnitario * this.factura.items[i].cantidad - this.factura.items[i].montoDescuento) * this.factura.items[i].impuestos / 100;
	// 	}
	// 	return tot;
	// }

	// public totalDescuentos(){
	// 	var tot = 0;
	// 	for (var i = this.factura.items.length - 1; i >= 0; i--) {
	// 		tot += this.factura.items[i].montoDescuento;
	// 	}
	// 	return tot;
	// }


	// totalComprobante(){
	// 	return this.totalVentasNeto() + this.totalImpuestos();
	// }

	// totalVentas(){
	// 	return this.totalMercaderiaGravada() + this.totalServiciosGravados() + this.totalServiciosExcentos() + this.totalMercaderiaExcenta()
	// }

	// totalVentasNeto(){
	// 	return this.totalVentas() - this.totalDescuentos();
	// }
	
}
