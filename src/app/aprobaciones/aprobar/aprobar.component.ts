import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgModel, DefaultValueAccessor, NgControl } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Parser } from 'xml2js';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { FacturaService } from '../../services/factura.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Aceptacion } from '../../models/aceptacion';
import { ActivatedRoute, Router } from '@angular/router'; 
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';


@Component({
	selector: 'app-aprobar',
	templateUrl: './aprobar.component.html',
	styleUrls: ['./aprobar.component.css']
})
export class AprobarComponent implements OnInit {

	public procesando : boolean = false;
	public buscando : boolean = false;
	public enviandoMH : boolean = false;
	private sub: any;
	public id : string = '';
	public aceptacion: Aceptacion = new Aceptacion();
	modalRefCompletar: BsModalRef;
	public aprobacion : any = {
		datos : {},
		cliente: {}
	};
	constructor(private dataService:DataService,
		private authService:AuthService,
		private modalService: BsModalService,
		private route: ActivatedRoute,
		private facturaService:FacturaService,
		private router:Router) { 
		this.sub = this.route.params.subscribe(params => {
	       this.id = params['id'];
	       console.log(this.id);
	       if(this.id != undefined){
		       this.dataService.get('/aprobacion/'+this.id).then((data) => {
					console.log(data);
					this.aceptacion = data.aprobacion;
					Object.assign(this.aprobacion.datos,data.aprobacion);
					console.log('data',this.aprobacion.datos.tipo_cedula_emisor);
				}, fail => {
				});
		    }
	    });
	}

	ngOnInit() {
	}

	updated($event) {
		var that = this;
		that.procesando = true;
		const files = $event.target.files || $event.srcElement.files;
		const file = files[0];
		const formData = new FormData();
		formData.append('file', file);
		var selectedFile = file;
		var readXml;
		var reader = new FileReader();
		reader.onload=function(e:any) {
			readXml=e.target.result;
			var parser = new Parser();
			var s = new XMLSerializer();
			parser.parseString(readXml,function (err, result) {
				console.log(result);
				if(result.MensajeHacienda){
					that.facturaService.post('/consultar/',{factura:{clave:result.MensajeHacienda.Clave[0]},cliente:{id:that.authService.loggedUser.idFacturador}})
					.then(res => {
						var xml = res.resp['respuesta-xml']
						var decoded = atob(xml);
						parser.parseString(decoded,function (err, resu) {
							that.aprobacion.datos.tipo = 'CCE';
							that.aprobacion.datos.mensaje = '1';
							that.aprobacion.datos.detalle_mensaje = 'Aceptada';
							that.aprobacion.datos.clave = resu.MensajeHacienda.Clave[0];
							that.aprobacion.datos.fecha_emision_doc = res.resp.fecha;

							that.aprobacion.datos.tipo_cedula_emisor = resu.MensajeHacienda.TipoIdentificacionEmisor[0];
							that.aprobacion.datos.numero_cedula_emisor = resu.MensajeHacienda.NumeroCedulaEmisor[0];
							that.aprobacion.datos.tipo_cedula_receptor = resu.MensajeHacienda.TipoIdentificacionReceptor[0];
							that.aprobacion.datos.numero_cedula_receptor = resu.MensajeHacienda.NumeroCedulaReceptor[0];
							that.aprobacion.datos.monto_total_impuesto = resu.MensajeHacienda.MontoTotalImpuesto[0];
							that.aprobacion.datos.total_factura = resu.MensajeHacienda.TotalFactura[0];
							that.aprobacion.datos.nombre_emisor = resu.MensajeHacienda.NombreEmisor[0];
							that.aprobacion.cliente = {
								id: that.authService.loggedUser.idFacturador
							}
							that.procesando = false;
						});
					}, err =>{
						console.log('error',err);
					})
				} else {
					that.aprobacion.datos.tipo = 'CCE';
					that.aprobacion.datos.mensaje = '1';
					that.aprobacion.datos.detalle_mensaje = 'Aceptada';
					that.aprobacion.datos.clave = result.FacturaElectronica.Clave[0];
					that.aprobacion.datos.fecha_emision_doc = result.FacturaElectronica.FechaEmision[0];

					that.aprobacion.datos.tipo_cedula_emisor = result.FacturaElectronica.Emisor[0].Identificacion[0].Tipo[0];
					that.aprobacion.datos.numero_cedula_emisor = result.FacturaElectronica.Emisor[0].Identificacion[0].Numero[0];
					that.aprobacion.datos.tipo_cedula_receptor = result.FacturaElectronica.Receptor[0].Identificacion[0].Tipo[0];
					that.aprobacion.datos.numero_cedula_receptor = result.FacturaElectronica.Receptor[0].Identificacion[0].Numero[0];
					that.aprobacion.datos.monto_total_impuesto = result.FacturaElectronica.ResumenFactura[0].TotalImpuesto[0];
					that.aprobacion.datos.total_factura = result.FacturaElectronica.ResumenFactura[0].TotalComprobante[0];
					//console.log('saber', result.FacturaElectronica.Emisor[0].Nombre[0])
					that.aprobacion.datos.nombre_emisor = result.FacturaElectronica.Emisor[0].Nombre[0];
					that.aprobacion.cliente = {
						id: that.authService.loggedUser.idFacturador
					}
					that.procesando = false;
				}
				console.log(that.aprobacion);
			});
		}
		reader.readAsText(selectedFile);
	}

	openModalCompletar(template: TemplateRef<any>) {
		this.modalRefCompletar = this.modalService.show(template);
	}

	enviarMH(status,template){
		var that = this;
		that.aprobacion.datos.tipo = status;
		switch (status) {
			case "CCE":
				that.aprobacion.datos.mensaje = '1';
				break;
			case "CPCE":
				that.aprobacion.datos.mensaje = '2';
				break;
			case "RCE":
				that.aprobacion.datos.mensaje = '3';
				break;
		}
		that.openModalCompletar(template);
		that.enviandoMH = true;
		Object.assign(that.aceptacion,that.aprobacion.datos);
		that.aceptacion.cliente = that.authService.loggedUser.idFacturador;
		that.aceptacion.FkIdSucursalBarberiaAprobacion = that.authService.loggedUser.idSucursal;
		that.facturaService.post('/aprobar/',that.aprobacion)
		.then(res => {
			console.log('res',res);
			if(res.error == 'recibido'){
				that.aceptacion.estado = 'enviada';
				that.aceptacion.claveAprobacion = res.clave;
				alert('Su solicitud fue enviada, pero el Ministerio de Hacienda está tardando mucho en responder, el estado se actualizará por si solo en 10 minutos o menos aproximadamente.')
				that.dataService.post('/aprobacion',{aprobacion:that.aceptacion})
				.then(resp => {
					that.enviandoMH = false;
					that.modalRefCompletar.hide();
					that.router.navigate(['/aprobar/'+resp.acceptacion._id]);
				}, error => { 
					that.enviandoMH = false;
					that.modalRefCompletar.hide();
				});
			} else if(res.respuesta == 'rechazado'){
				that.aceptacion.estado = 'rechazada';
				that.aceptacion.claveAprobacion = res.clave;
				alert('Su solicitud fue enviada, pero el Ministerio de Hacienda la rechazó, por favor comuniquese con KYRapps para conocer los pasos a seguir.')
				that.dataService.post('/aprobacion',{aprobacion:that.aceptacion})
				.then(resp => {
					that.enviandoMH = false;
					that.modalRefCompletar.hide();
					that.router.navigate(['/aprobar/'+resp.acceptacion._id]);
				}, error => { 
					that.enviandoMH = false;
					that.modalRefCompletar.hide();
				});
			} else if(res.respuesta == 'error' || res.estado == 'error en hacienda'){
				alert('Su solicitud fue enviada, pero el Ministerio de Hacienda parece estar teniendo problemas, por favor intentelo de nuevo mas tarde.')
			} else {
				that.aceptacion.estado = 'completada';
				that.aceptacion.claveAprobacion = res.clave;
				that.dataService.post('/aprobacion',{aprobacion:that.aceptacion})
				.then(resp => {
					that.enviandoMH = false;
					that.modalRefCompletar.hide();
					that.router.navigate(['/aprobar/'+resp.acceptacion._id]);
				}, error => { 
					that.enviandoMH = false;
					that.modalRefCompletar.hide();
				});
			}
			
		}, err =>{
			console.log('error',err);
			that.enviandoMH = false;
			that.modalRefCompletar.hide();
		})
	}

	// reenviarMH(template){
	// 	var that = this;
	// 	that.openModalCompletar(template);
	// 	that.enviandoMH = true;
	// 	var data:any = that.aceptacion;
	// 	data.revisar = true;
	// 	that.facturadorService.post('/aprobar/',{datos:data,cliente:{id:that.authService.loggedUser.idFacturadorAPI}})
	// 	.then(res => {
	// 		if(res.error == 'recibido'){
	// 			that.aceptacion.estado = 'enviada';
	// 			alert('Su solicitud fue enviada, pero el Ministerio de Hacienda está tardando mucho en responder, el estado se actualizara por si solo en 10 minutos o menos aproximadamente')
	// 			that.aceptacionService.editarAceptacion(that.aceptacion)
	// 			.then(resp => {
	// 				that.enviandoMH = false;
	// 				that.modalRefCompletar.hide();
	// 			}, error => { 
	// 				that.enviandoMH = false;
	// 				that.modalRefCompletar.hide();
	// 			});
	// 		} if(res.respuesta == 'error' || res.estado == 'error en hacienda'){
	// 			alert('Su solicitud fue enviada, pero el Ministerio de Hacienda parece estar teniendo problemas, por favor intentelo de nuevo.')
	// 		} else {
	// 			that.aceptacion.estado = 'completada';
	// 			that.aceptacionService.editarAceptacion(that.aceptacion)
	// 			.then(resp => {
	// 				that.enviandoMH = false;
	// 				that.modalRefCompletar.hide();
	// 			}, error => { 
	// 				that.enviandoMH = false;
	// 				that.modalRefCompletar.hide();
	// 			});
	// 		}
	// 	}, err =>{
	// 		console.log('error',err);
	// 		that.enviandoMH = false;
	// 		that.modalRefCompletar.hide();
	// 	})
	// }

	buscar(clave){
		if(clave && clave.length == 50){
			this.buscando = true;
			console.log(clave);
			var that = this;
			that.facturaService.post('/consultar/',{factura:{clave:clave},cliente:{id:that.authService.loggedUser.idFacturador}})
			.then(res => {
				if(res.resp){
					var xml = res.resp['respuesta-xml']
					var decoded = atob(xml);
					var parser = new Parser();
					parser.parseString(decoded,function (err, result) {
						that.aprobacion.datos.tipo = 'CCE';
						that.aprobacion.datos.mensaje = '1';
						that.aprobacion.datos.detalle_mensaje = 'Aceptada';
						that.aprobacion.datos.clave = result.MensajeHacienda.Clave[0];
						that.aprobacion.datos.fecha_emision_doc = res.resp.fecha;

						that.aprobacion.datos.tipo_cedula_emisor = result.MensajeHacienda.TipoIdentificacionEmisor[0];
						that.aprobacion.datos.numero_cedula_emisor = result.MensajeHacienda.NumeroCedulaEmisor[0];
						that.aprobacion.datos.tipo_cedula_receptor = result.MensajeHacienda.TipoIdentificacionReceptor[0];
						that.aprobacion.datos.numero_cedula_receptor = result.MensajeHacienda.NumeroCedulaReceptor[0];
						that.aprobacion.datos.monto_total_impuesto = result.MensajeHacienda.MontoTotalImpuesto[0];
						that.aprobacion.datos.total_factura = result.MensajeHacienda.TotalFactura[0];
						that.aprobacion.cliente = {
							id: that.authService.loggedUser.idFacturador
						}
						that.buscando = false;
					});
				} else {
					alert('La clave introducida no corresponde a ninguna factura, por favor revise la clave ingresada.')
				}
			}, err =>{
				console.log('error',err);
			})
		} else {
			alert('La clave debe ser de 50 digitos, por favor revise la clave ingresada.')
		}
	}

}
