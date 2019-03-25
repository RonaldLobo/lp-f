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
	public cargando: boolean = false;
	public selectedFactura:any={};
	public selectedProvincia : any = {};
 	public selectedCanton : any = {};
	public modalRef: BsModalRef;
	public printRefCompletar: BsModalRef;
	modalRefEliminar: BsModalRef;
	modalRefCompletar: BsModalRef;
	public sucursal: any = {};
	public facturaHacienda : any = {};
	public enviandoMH: boolean = false;
	public nuevoUsuario:Usuario = new Usuario();
	public infoRefeTipoDoc:string = '';
	public infoRefeNumero:string = '';
	public infoRefeFechaEmision:string = '';
	public infoRefeCodigo:string = '';
	public infoRefeRazon:string = '';
	public tipoNota:string = '';
	public isEliminar: boolean = false;
	public factura: any = {};
	public today= new Date();	
	public tiposPago = ['Efectivo','Tarjeta','Cheque','Transferencia','Tercero','Otros'];
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
	openModalCompletar(template: TemplateRef<any>) {
		this.modalRefCompletar = this.modalService.show(template);
	}

	openModalEliminar(template: TemplateRef<any>){
		this.modalRefEliminar = this.modalService.show(template);
	}

	openModalPrint(template: TemplateRef<any>) {
		this.printRefCompletar = this.modalService.show(template);
	}

	ngOnInit() {

		var that = this;
		setTimeout(function(){
			/*that.dataService.get('/reserva?idSucursal='+that.authService.loggedUser.idSucursal+'&estadoFactura=P')
			.then(response => {
				console.log('reservas',response.reserva);
				that.facturas = that.updateTimeToHora(response.reserva);
			},
			error => {
			});*/

			that.dataService.get('/factura?idSucursal='+that.authService.loggedUser.idSucursal)//+'&estado=P'
			.then(response => {
				console.log('factura',response.factura);
				that.facturas =  response.factura;//that.updateTimeToHora(response.factura);
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
		        console.log(that.sucursal);
			},(error)=>{
				console.log('error',error);
			});

			console.log('sucursal',that.sucursal);
		},2000);
	}

	public updateTimeToHora(pausas){
		for (var i = pausas.length - 1; i >= 0; i--) {
			pausas[i].horaInicialFormat = Number(pausas[i].horaInicial.substring(0, 2) + pausas[i].horaInicial.substring(3, 5));
		}
		return pausas;
	}


	public cargarFactura(factura){
		console.log('factura', factura);

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

	formatDateShort(date:Date){
		return this.datePipe.transform(date, 'yyyy-MM-dd')
	}

	formatTime(date:Date){
		return this.datePipe.transform(date, 'HH:mm:ss')
	}


//*************************************************************************************************************
//									IMPRIMIR EN HOJA
//*************************************************************************************************************

	genLetter(cb,tipo = 0){
		var that = this;
		var doc;
		var img = new Image();
		img.addEventListener('load', function() {
			// header
			//var pags = Math.ceil(that.factura.detalleFactura.length / 32);
			var ancho = 80;//(that.authService.loggedEmpresa.logoAncho && that.authService.loggedEmpresa.logoAncho != 0) ? that.authService.loggedEmpresa.logoAncho : 80;
			//console.log('ancho',ancho);
			doc = new window.jsPDF('p','pt','letter');
			// var i = 0;
			// console.log('j',j,pags);
			var j = 0;
			//var temparray: Productofacturaitem[] = [],o,f,chunk = 32;
			//for (o=0,f=that.factura.detalleFactura.length; o<f; o+=chunk) {
				//temparray = that.factura.detalleFactura.slice(o,o+chunk);
			//	console.log(temparray);
			// for (var j = 0 ; j < pags; j++) {
			//	console.log('looped',i,pags);
				doc.setFont("helvetica");
				doc.setFontType("bold");
				doc.setFontSize("12");
				var splitNombre = doc.splitTextToSize(that.sucursal.nombreNegocio, 300);
			    console.log('split',splitNombre);
			    var altoHeader = 20;
			    doc.text(splitNombre, ancho+20, altoHeader);
			    if(splitNombre.length > 1){
			    	altoHeader = 16 * splitNombre.length;
			    }
				doc.text(that.selectedFactura.cedulaBarbero, ancho+20, altoHeader + 15);
				doc.setFont("helvetica");
				doc.setFontType("normal");
				doc.setFontSize("8");
				doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, ancho+20, altoHeader + 30);
				doc.text('Tel. '+that.sucursal.telefono[0].telefono, ancho+20, altoHeader + 40);
				doc.text(that.sucursal.correo[0].correo, ancho+20, altoHeader + 50);


			//	if(that.authService.loggedEmpresa.paginaWeb){
			//		doc.text(that.authService.loggedEmpresa.paginaWeb, ancho+20, altoHeader + 60);
			//	}

			console.log('that.selectedFactura',that.selectedFactura);
				img.width = ancho;
				img.height = 80;
			    doc.addImage(img, 'png', 25, 20);
			    // fin header
			    // numero factura
			 	doc.setFont("helvetica");
			    doc.setFontType("bold");
			    doc.setFontSize("10");
			    doc.text('Fecha', 25, 115);
			    doc.text(that.selectedFactura.fecha, 110, 115);//that.datePipe.transform(new Date(that.factura.fecha), 'dd/MM/yyyy hh:mm:ss aa')

			    doc.text('Tipo Factura', 25, 130);
			    doc.text('Contado', 110, 130);//that.factura.condventa == '01' ? 'Contado': 'Crédito'
			    if(that.factura.tipoPago == 'efectivo'){
			    	that.factura.tipoPago = '01';
			    } else if(that.factura.tipoPago == 'tarjeta'){
			    	that.factura.tipoPago = '02';
			    } else if(that.factura.tipoPago == 'transferencia'){
			    	that.factura.tipoPago = '04';
			    } else {
			    	that.factura.tipoPago = '01';
			    }
			    var medio = that.factura.tipoPago || '01';
			    doc.text('Medio de Pago', 25, 145);
			    doc.text(that.tiposPago[Number(that.factura.tipoPago) - 1], 110, 145);
			    doc.rect(300, 100, 280, 80);
			    doc.text('Cliente', 310, 115);
			    
			    if(tipo == 0 || tipo == 2 || tipo == 3 || tipo == 4){
			    	doc.text('Doc. No', 25, 100);
				    var con = that.selectedFactura.consecutivo || 'Sin consecutivo';
				    doc.text(con, 110, 100);
				    var posClave =  160;
				    doc.text('Clave Fiscal', 25, posClave);
				    var cla = that.selectedFactura.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 160);
			    	doc.text(splitCla, 110, posClave);
				}
				/*if(tipo == 1){
				    doc.text('Factura Proforma', 25, 100);
				    doc.text('Valida por '+that.validaPor+' días', 150, 100);
				}*/
				if(tipo == 2){
					doc.setFont("helvetica");
				    doc.setFontType("normal");
				    doc.setFontSize("10");
				    doc.text('Documento Eliminado', 300, 55);
				    doc.text('Documento Original No', 300, 70);
				    var con = that.factura.consecutivo || 'Sin consecutivo';
				    doc.text(con, 420, 70);
				    doc.text('Clave Fiscal Original', 300, 85);
				    var cla = that.factura.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 150);
			    	doc.text(splitCla, 420, 85);
				}
				if(tipo == 3){
					doc.setFont("helvetica");
				    doc.setFontType("normal");
				    doc.setFontSize("10");
				    doc.text('Nota de Crédito', 300, 55);
				    doc.text('Documento Original No', 300, 70);
				    var con = that.factura.consecutivo || 'Sin consecutivo';
				    doc.text(con, 420, 70);
				    doc.text('Clave Fiscal Original', 300, 85);
				    var cla = that.factura.clave || 'Sin clave';
				    var splitCla = doc.splitTextToSize(cla, 150);
			    	doc.text(splitCla, 420, 85);
				}
				if(tipo == 4){
					doc.setFont("helvetica");
				    doc.setFontType("normal");
				    doc.setFontSize("10");
				    doc.text('Nota de Debito', 300, 55);
				    doc.text('Documento Original No', 300, 70);
				    var con = that.factura.consecutivo || 'Sin consecutivo';
				    doc.text(con, 420, 70);
				    doc.text('Clave Fiscal Original', 300, 85);
				    var cla = that.factura.clave || 'Sin clave';
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
			    if(that.selectedFactura.nombreUserReserva != ''){
			    	doc.text('Cédula', 310, 130);
			    	doc.text(''+that.selectedFactura.cedulaUser, 380, 130);
			    	var splitCliente = doc.splitTextToSize(that.selectedFactura.nombreUserReserva + ' ' +
			    		that.selectedFactura.primerApellidoUserReserva + ' ' +
			    		that.selectedFactura.segundoApellidoUserReserva, 180);
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
				doc.line(100, 200, 100, 700);
				doc.line(280, 200, 280, 700);
				doc.line(330, 200, 330, 700);
				doc.line(400, 200, 400, 700);
				doc.line(480, 200, 480, 700);
			    doc.setFontSize("8");
			    doc.text('Código', 47, 210);
			    doc.text('Producto', 200, 210);
			    doc.text('Cantidad', 290, 210);
			    doc.text('Descuento', 345, 210);
			    doc.text('Precio und', 420, 210);
			    doc.text('Precio', 520, 210);
			    // fin tabla productos
			    // agregar productos
			    y = 223;
				for (var i = that.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
					doc.text(''+that.selectedFactura.detalleFactura[i].codigo, 60, y, 'center');
					doc.text(''+that.selectedFactura.detalleFactura[i].producto, 110, y);
					doc.text(''+that.selectedFactura.detalleFactura[i].cantidad, 310, y, 'right');
					doc.text(that.toDecimals(that.selectedFactura.detalleFactura[i].descuento), 380, y, 'right');
					doc.text(that.toDecimals(that.selectedFactura.detalleFactura[i].precio), 460, y, 'right');
					doc.text(that.toDecimals(that.selectedFactura.detalleFactura[i].total), 550, y, 'right');//.toFixed(2)
					y += 13;
				}

			    // fin agregar productos
		
			    if(that.sucursal.pieFactura){
				    var splitTitle = doc.splitTextToSize(that.sucursal.pieFactura, 200);
					doc.text(splitTitle, 35, 670);
				}
				//var moneda = that.factura.moneda || 'CRC'; 
			    doc.setFontSize("10");
				doc.setFontType("bold");
			    doc.text('Total Bruto', 370, 670);
			    doc.setFontType("normal");
			    doc.text(that.toDecimals(that.selectedFactura.total), 560, 670, 'right');
			    doc.text('Descuento', 370, 690);
			    doc.text(that.toDecimals(that.selectedFactura.totalDescuento), 560, 690, 'right');
			    doc.text('Total Neto', 370, 710);
			    doc.text(that.toDecimals(that.selectedFactura.totalNeto), 560, 710, 'right');
			    doc.text('Impuestos', 370, 730);
			    doc.text(that.toDecimals(that.selectedFactura.totalImpuesto), 560, 730, 'right');
			    doc.setFontSize("11");
				doc.setFontType("bold");
			    doc.text('Total Factura', 370, 750);
			    doc.text(that.toDecimals(that.selectedFactura.total), 560, 750, 'right');
			  //  doc.text('Pag. '+(j+1)+' de '+ pags, 540, 15);
			  /*  if(that.factura.moneda == "USD"){
					doc.text('Tipo de cambio: ', 390, 770);
					doc.text(that.toDecimals(that.factura.tipoCambio), 560, 770, 'right');
				}
			    if(j < pags - 1){
			    	doc.addPage();
			    }
			    j++;
			}*/
		    // fin total
		    cb(doc);
		});
		var imgName = this.sucursal.logoName|| 'kyr.jpg';
		img.src = 'assets/' + imgName;
	}



//*************************************************************************************************************
//									FIN IMPRIMIR EN HOJA
//*************************************************************************************************************


//*************************************************************************************************************
//									 IMPRIMIR EN PUNTO DE VENTA
//*************************************************************************************************************
	imprimir(tipo){
		var doc;
		var that = this;
		if(tipo == 'A4'){
			this.genLetter(that.printDoc);
		} else {
			var height = 72;
			height +=  that.selectedFactura.detalleFactura.length  * 4;
			doc = new window.jsPDF('p','mm',[60,height]);
			doc.setFontSize("10");
			doc.setFontType("bold");
			doc.text(that.sucursal.nombreNegocio, 30, 8,"center");
			doc.setFontSize("7");
			doc.setFontType("normal");
			var con = that.selectedFactura.consecutivo || 'Sin consecutivo';
			doc.text(con, 30, 12,"center");
			var clave = that.selectedFactura.clave.substring(1, 35);
			var clave2 = that.selectedFactura.clave.substring(35, that.selectedFactura.clave.lenght);
			doc.text(clave, 30, 16,"center");
			doc.text(clave2, 30, 20,"center");


			doc.text(that.selectedFactura.fecha, 30, 24,"center");
			doc.text(that.selectedCanton.nombre +', '+that.selectedProvincia.nombre, 30, 28,"center");
			doc.text('Tel. '+that.sucursal.telefono[0].telefono, 30, 32,"center");
			doc.text(that.sucursal.correo[0].correo, 30, 36,"center");
			if(that.sucursal.paginaWeb){
				doc.text(that.sucursal.paginaWeb, 30, 36,"center");
			}
			//if(that.sucursal.cedulaJuridica){
				doc.text(that.selectedFactura.cedulaBarbero, 30, 40,"center");
			//}
			doc.text('Vendedor:', 7, 44,"left");
			doc.text(that.selectedFactura.nombreBarbero + ' ' + that.selectedFactura.primerApellidoBarbero +' '+ that.selectedFactura.segundoApellidoBarbero, 30, 44,"left");
			//display products

			var y = 48;
			for (var i = that.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
				doc.text(''+that.selectedFactura.detalleFactura[i].producto, 7, y,'left');
				doc.text(that.toDecimals(that.selectedFactura.detalleFactura[i].total), 50, y, 'right');
				y += 4;
			}


			// end display
			// total
			doc.text('-------------------------------------------------------------', 30, y,"center");
			doc.text('Total Neto: ', 35, y+4,"right");
			doc.text(that.toDecimals(that.selectedFactura.totalNeto), 52, y+4,"right");
			doc.text('Total Impuestos: ', 35, y+8,"right");
			doc.text(that.toDecimals(that.selectedFactura.totalImpuesto), 52, y+8,"right");
			doc.text('Total: ', 35,y+12,"right");
			doc.text(that.toDecimals(that.selectedFactura.total), 52, y+12,"right");
			// fin total
			doc.setFontSize("8");
			doc.text('Muchas Gracias', 30,y+19,"center");
			that.printDoc(doc);
			// doc.save('pdv.pdf')
		}
	}

//*************************************************************************************************************
//									FIN IMPRIMIR EN PUNTO DE VENTA
//*************************************************************************************************************
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

	console.log('this.selectedFactura',this.selectedFactura);
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

	//	this.facturaHacienda.factura.detalles['1'] = {};
	//	this.facturaHacienda.factura.detalles['1'].cantidad = '1';
	//	this.facturaHacienda.factura.detalles['1'].unidadMedida = 'Sp';
	//	this.facturaHacienda.factura.detalles['1'].detalle = this.selectedFactura.servicio
	//	this.facturaHacienda.factura.detalles['1'].precioUnitario = this.selectedFactura.precio;
	//	this.facturaHacienda.factura.detalles['1'].montoTotal = this.selectedFactura.precio;
	//	this.facturaHacienda.factura.detalles['1'].subtotal = this.selectedFactura.precio;
	//	this.facturaHacienda.factura.detalles['1'].montoTotalLinea = this.selectedFactura.precio;


		for (var i = 0; i < this.selectedFactura.length; i++) {
			this.facturaHacienda.factura.detalles[''+(i + 1)] = {};
			this.facturaHacienda.factura.detalles[''+(i + 1)].cantidad = this.selectedFactura[i].cantidad;
			this.facturaHacienda.factura.detalles[''+(i + 1)].unidadMedida = this.selectedFactura[i].unidad;
			this.facturaHacienda.factura.detalles[''+(i + 1)].detalle = this.selectedFactura[i].detalle;
			this.facturaHacienda.factura.detalles[''+(i + 1)].precioUnitario = Number(this.selectedFactura[i].precio).toFixed(2);
			this.facturaHacienda.factura.detalles[''+(i + 1)].montoTotal = Number(this.selectedFactura[i].total).toFixed(2);
			this.facturaHacienda.factura.detalles[''+(i + 1)].subtotal = Number(this.selectedFactura[i].cantidad * this.selectedFactura[i].precio - this.descuentoPorProducto(this.selectedFactura[i])).toFixed(2);
			this.facturaHacienda.factura.detalles[''+(i + 1)].montoTotalLinea = Number(((this.selectedFactura[i].cantidad * this.selectedFactura[i].precio - this.descuentoPorProducto(this.selectedFactura[i]) + ((this.selectedFactura[i].cantidad * this.selectedFactura[i].precio - this.descuentoPorProducto(this.selectedFactura[i])) * this.selectedFactura[i].impuesto / 100))).toFixed(2));
			this.facturaHacienda.factura.detalles[''+(i + 1)].naturalezaDescuento = this.selectedFactura[i].razonDescuento;
				
		}

		this.facturaHacienda.factura.refreshToken = this.facturaHacienda.factura.refresh || '';
		this.facturaHacienda.factura.clave = this.facturaHacienda.factura.clave || '';
		this.facturaHacienda.factura.xml = this.facturaHacienda.factura.xml || '';
		this.facturaHacienda.factura.consecutivo = this.facturaHacienda.factura.consecutivo || '';

		this.facturaHacienda.cliente.id = this.sucursal.idFacturaAPI;
	
	}








	formatDate(date:Date){
		return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss-06:00')
	}


//*********************************************************************************************************************************
//													ANULAR FACTURA
//*********************************************************************************************************************************


	completarNota(temp){
		this.enviandoMH = true;
		this.enviarNotaHacienda(temp);
	}


	enviarNotaHacienda(temp){
		var that = this;
		var tipoEnvio;
		var tipoFactura = 1;
		if(this.isEliminar){//this.totalComprobante() < this.totalOriginal || 
			tipoEnvio = '/notacredito/';
			this.tipoNota = 'NC';
			tipoFactura = 3;
			if(this.isEliminar){
				tipoFactura = 2;
			}
		} else {
			tipoEnvio = '/notadebito/';
			this.tipoNota = 'ND';
			tipoFactura = 4;
		}
		var fact = this.createNota();
		console.log(fact);
		//fact.con = true;
		that.facturaService.post(tipoEnvio,fact)
		.then(res => {
			console.log('res',res);
			//fact.con = false;
			console.log('con check',that.factura.consecutivoOriginal);
			if(that.factura.consecutivoOriginal == ''){
				that.factura.consecutivoOriginal = that.factura.consecutivo;
				that.factura.claveOriginal = that.factura.clave;
				that.factura.fechaOriginal = ''+that.factura.fecha_modificada;
			}
			that.factura.consecutivo = res.resp.consecutivo;
			that.factura.clave = res.resp.clave;
			that.genLetter(function(doc){
				var blob = doc.output("blob");
				that.blobToBase64(blob,function(base){
					/*fact.facturabase = {
						base: base
					};*/
					that.facturaService.post(tipoEnvio,fact)
					.then(res => {
						that.enviandoMH = false;
						console.log('res',res);
						that.factura.infoRefeNumero = that.infoRefeNumero;
						that.factura.infoRefeFechaEmision = that.infoRefeFechaEmision;
						that.factura.infoRefeCodigo = (that.isEliminar) ? '01' : that.infoRefeCodigo;
						that.factura.infoRefeRazon = that.infoRefeRazon;
						console.log('prueba',that.infoRefeCodigo);
						if(res.respuesta == "aceptado"){
							if(that.isEliminar){
								that.factura.estado = 'C';
								that.guardar('cancelada',null);
								that.modalRefEliminar.hide();
							} else {
								that.factura.estado = 'P';
								that.guardar('completa',null);
								that.modalRefCompletar.hide();
							}
						} else if(res.error == "recibido"){
							alert('Su nota fue enviada pero el Ministerio de Hacienda esta tardando mucho tiempo en responder, por favor reintente el envío desde "Facturas"')
							that.factura.estado = 'E';
							that.factura.refresh = res.refreshToken
							that.factura.xml = res.xml
							that.guardar('enviada',null);
							if(that.isEliminar){
								that.modalRefEliminar.hide();
							} else {
								that.modalRefCompletar.hide();
							}
						} else {
							that.factura.estado = 'R';
							that.guardar('rechazada',null);
							alert('Lo sentimos pero su nota no fue aceptada por el Ministerio de Hacienda, por favor intentelo de nuevo.');
							if(that.isEliminar){
								that.modalRefEliminar.hide();
							} else {
								that.modalRefCompletar.hide();
							}
						}
						that.isEliminar = false;
					}, err =>{
						console.log('error',err);
						that.enviandoMH = false;
						that.modalRefCompletar.hide();
					});
				});
			},tipoFactura);
		}, err =>{
			console.log('error',err);
			that.modalRefCompletar.hide();
			that.enviandoMH = false;
		});
	}



	async createNota(){
		var that = this;
		var fact : any = {};

		var usuarioRese=  await that.obtenerUsuario(that.selectedFactura.idCliente);
		var usuarioReserva : Usuario = usuarioRese.usuario;
		fact.factura = {
				fecha : that.formatDate(new Date()),
				nombreComercial: that.sucursal.nombreNegocio,
				situacion: "normal",
				emisor: {
					nombre: that.facturas.nombreBarbero + ' ' + that.facturas.primerApellidoBarbero + ' ' + that.facturas.segundoApellidoBarbero,
					tipoId: '01',
					id: that.selectedFactura.cedulaBarbero,
					provincia: that.authService.provinciaSucursal,
					canton: that.authService.cantonSucursal,
					distrito: that.authService.distritoSucursal,
					barrio: that.authService.barrioSucursal,
					senas: that.authService.detalleDireccionSucursal,
					codigoPaisTel: '506',
					tel: this.sucursal.telefonos[0].telefono,
					codigoPaisFax:"",
					fax:"",
					email: this.sucursal.correo[0].correo
				},
				condicionVenta:that.factura.condventa,
				plazoCredito: that.factura.plazoCredito || "0",
				medioPago: that.factura.tipoPago || "01",
				codMoneda: that.factura.moneda || "CRC",
				tipoCambio: that.factura.tipoCambio || "1",
				totalServGravados: Number(that.totalServiciosGravados().toFixed(2)),
				totalServExentos: Number(that.totalServiciosExcentos().toFixed(2)),
				totalMercGravada: Number(that.totalMercaderiaGravada().toFixed(2)),
				totalMercExenta: Number(that.totalMercaderiaExcenta().toFixed(2)),
				totalGravados: Number((that.totalMercaderiaGravada() + that.totalServiciosGravados()).toFixed(2)),
				totalExentos: Number((that.totalServiciosExcentos() + that.totalMercaderiaExcenta()).toFixed(2)),
				totalVentas: Number(that.totalVentas().toFixed(2)),
				totalDescuentos: Number(that.totalDescuentos().toFixed(2)),
				totalVentasNeta: Number(that.totalVentasNeto().toFixed(2)),
				totalImpuestos: Number(that.totalImpuestos().toFixed(2)),
				totalComprobante: Number(that.totalComprobante().toFixed(2)),
				otros:"Gracias.",
				detalles: {},
				infoRefeNumero: that.selectedFactura.clave,
				infoRefeFechaEmision: that.selectedFactura.fecha,
				infoRefeCodigo: (that.isEliminar) ? '01' : '03',
				infoRefeRazon: 'Cambio'
			};
		fact.cliente = {
				id: that.authService.idFacturaAPI
			}
		for (var i = 0; i < that.selectedFactura.detalleFactura.length; i++) {
			var num = i + 1;
			if(that.selectedFactura.detalleFactura[i].impuestos){
				fact.factura.detalles[num]= {
					cantidad: that.selectedFactura.detalleFactura[i].cantidad,
					unidadMedida: that.selectedFactura.detalleFactura[i].producto.unidad,
					detalle: that.selectedFactura.detalleFactura[i].descripcion,
					precioUnitario: Number(that.selectedFactura.detalleFactura[i].precio.toFixed(2)),
					montoTotal: that.selectedFactura.detalleFactura[i].cantidad * Number(that.selectedFactura.detalleFactura[i].precio.toFixed(2)),
					subtotal: that.selectedFactura.detalleFactura[i].cantidad * Number(that.selectedFactura.detalleFactura[i].precio.toFixed(2)) - that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]),
					montoTotalLinea: Number(((that.selectedFactura.detalleFactura[i].cantidad * that.selectedFactura.detalleFactura[i].precio - that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]) + ((that.selectedFactura.detalleFactura[i].cantidad * that.selectedFactura.detalleFactura[i].precio - that.descuentoPorProducto(that.selectedFactura.detalleFactura[i])) * that.selectedFactura.detalleFactura[i].impuesto / 100))).toFixed(2)),
					montoDescuento: that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]),
					naturalezaDescuento: (that.descuentoPorProducto(that.selectedFactura.detalleFacturas[i]))? 'usuario':'',
					impuesto:{
						"1":{
							codigo: '01',
							tarifa: that.selectedFactura.detalleFactura[i].impuestos,
							monto: Number((((that.selectedFactura.detalleFactura[i].cantidad * that.selectedFactura.detalleFactura[i].precio - that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]) ) * that.selectedFactura.detalleFactura[i].impuesto / 100)).toFixed(2))
						}
					}
				}
			} else {
				fact.factura.detalles[num]= {
					cantidad: that.selectedFactura.detalleFactura[i].cantidad,
					unidadMedida: that.selectedFactura.detalleFactura[i].unidad,
					detalle: that.selectedFactura.detalleFactura[i].descripcion,
					precioUnitario: that.selectedFactura.detalleFactura[i].precio,
					montoTotal: that.selectedFactura.detalleFactura[i].cantidad * that.selectedFactura.detalleFactura[i].precio,
					subtotal: that.selectedFactura.detalleFactura[i].cantidad * that.selectedFactura.detalleFactura[i].precio - that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]),
					montoTotalLinea: that.selectedFactura.detalleFactura[i].cantidad * that.selectedFactura.detalleFactura[i].precio - that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]),
					montoDescuento: that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]),
					naturalezaDescuento: (that.descuentoPorProducto(that.selectedFactura.detalleFactura[i]))? 'usuario':''
				}
			}
		}
		// console.log(this.factura);
		console.log('com',that.selectedFactura.cedulaUser);
		if(that.selectedFactura.cedulaUser == 0){
			fact.selectedFactura.omitirReceptor = "true";
			fact.selectedFactura.infoRefeTipoDoc = '04';
		} else {
			fact.selectedFactura.omitirReceptor = "false";
			fact.selectedFactura.infoRefeTipoDoc = '01';
		}
		fact.factura.receptor = {
			nombre:that.selectedFactura.nombreUserReserva + ' ' + that.selectedFactura.primerApellidoUserReserva  + ' '+ that.selectedFactura.segundoApellidoUserReserva,
			tipoId:that.factura.comprador.tipoId,
			id:that.selectedFactura.cedulaUser,
			provincia:usuarioReserva.idProvincia,
			canton:usuarioReserva.idCanton,
			distrito:usuarioReserva.distrito,
			barrio:"01",
			senas:"senas",
			codigoPaisTel:"506",
			tel:(usuarioReserva.telefono.length > 0 ) ? usuarioReserva.telefono[0].telefono : '',
			codigoPaisFax:"",
			fax:"",
			email:usuarioReserva.correo
		}
		fact.factura.refreshToken = that.selectedFactura.refresh || '';
		fact.factura.clave = that.selectedFactura.clave || '';
		fact.factura.xml = that.selectedFactura.xml || '';
		fact.factura.consecutivo = that.selectedFactura.consecutivo || '';
		return fact;
	}


	guardar(estado = 'pendiente',template){
		
		var that = this;
		that.dataService.post('/factura/?method=put&tipoUpdate=E', {'factura':that.factura})
				             .then(response => {
				             //	alert('Factura ' + estado);
				             	console.log('Factura ' + estado+response);
				            },
				             error => {
				        	});
		if (that.factura.estado == 'P'){
			that.dataService.post('/inventario/?method=put&tipoUpdate=C', {'inventario':that.factura.detalleFactura})
			             .then(response => {
			             	//alert('Factura ' + estado);
			             	//that.openModalAgotados(template);
			             	console.log('inventario '+response);
			            },
			             error => {
			        	});
		}
	
	}


//*********************************************************************************************************************************
//													FIN ANULAR FACTURA
//*********************************************************************************************************************************



//*********************************************************************************************************************************
//													FORMULAS
//*********************************************************************************************************************************

	totalServiciosGravados(){
		var total = 0;
		for (var i = this.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
			if(this.selectedFactura.detalleFactura[i].unidad == 'Sp' && this.selectedFactura.detalleFactura[i].impuesto){
				total += this.selectedFactura.detalleFactura[i].cantidad * this.selectedFactura.detalleFactura[i].precio;
			}
		}
		return total;
	}

	totalServiciosExcentos(){
		var total = 0;
		for (var i = this.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
			if(this.selectedFactura.detalleFactura[i].unidad == 'Sp' && this.selectedFactura.detalleFactura[i].impuesto == 0){
				total += this.selectedFactura.detalleFactura[i].cantidad * this.selectedFactura.detalleFactura[i].precio;
			}
		}
		return total;
	}

	totalMercaderiaGravada(){
		var total = 0;
		for (var i = this.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
			if(this.selectedFactura.detalleFactura[i].unidad != 'Sp' && this.selectedFactura.detalleFactura[i].impuesto){
				total += this.selectedFactura.detalleFactura[i].cantidad * this.selectedFactura.detalleFactura[i].precio;
			}
		}
		return total;
	}

	totalMercaderiaExcenta(){
		var total = 0;
		for (var i = this.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
			if(this.selectedFactura.detalleFactura[i].unidad != 'Sp' && this.selectedFactura.detalleFactura[i].impuesto == 0){
				total += this.selectedFactura.detalleFactura[i].cantidad * this.selectedFactura.detalleFactura[i].precio;
			}
		}
		return total;
	}

	public totalImpuestos(){
		var tot = 0;
		for (var i = this.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
			tot += Number(((this.selectedFactura.detalleFactura[i].precio * this.factura.items[i].cantidad - this.selectedFactura.detalleFactura[i].montoDescuento) * this.selectedFactura.detalleFactura[i].impuesto / 100).toFixed(2));
		}
		return tot;
	}

	public totalDescuentos(){
		var tot = 0;
		for (var i = this.selectedFactura.detalleFactura.length - 1; i >= 0; i--) {
			tot += this.selectedFactura.detalleFactura[i].montoDescuento;
		}
		return tot;
	}


	totalVentasNeto(){
		return this.totalVentas() - this.totalDescuentos();
	}

	totalComprobante(){
		return this.totalVentasNeto() + this.totalImpuestos();
	}

	totalVentas(){
		return this.totalMercaderiaGravada() + this.totalServiciosGravados() + this.totalServiciosExcentos() + this.totalMercaderiaExcenta()
	}


//*********************************************************************************************************************************
//													FIN FORMULAS
//*********************************************************************************************************************************

//*********************************************************************************************************************************
//											OBTENER INFORMACIÓN DEL USUARIO
//*********************************************************************************************************************************

	
	public async obtenerUsuario(id){
		return this.dataService.get('/usuario/'+ id);
	}
//*********************************************************************************************************************************
//											FIN OBTENER INFORMACIÓN DEL USUARIO
//*********************************************************************************************************************************



public async actualizarBasePF(){

        var that = this;
		await this.facturacionHacienda();
		var fact = this.facturaHacienda;
		console.log('fact reenviarMH',fact);

			console.log('that.selectedFactura',that.selectedFactura);
		that.enviandoMH = true;
		fact.conrealizada = true;
		that.genLetter(function(doc){
			var blob = doc.output("blob");
			that.blobToBase64(blob,function(base){
				fact.facturabase = {
					base: base
				};
				that.factura.base = base;
				that.factura.id = that.selectedFactura.id;

				console.log('base: ',base);

			    that.dataService.post('/factura/?method=modBase',{factura:that.factura})
				             .then(response => {
				             	alert('Información actualizada');
				            	that.enviandoMH = false;
				            	that.cargando = false;
				             	console.log(response);
				            },
				             error => {
				             	that.enviandoMH = false;
						 		that.factura.estado = 'R';
						 		this.spinnerEmitiendoFactura = false;
				        	});
			});
		});
	}

}
