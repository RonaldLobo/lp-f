import { Component, OnInit ,TemplateRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

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
	public modalRef: BsModalRef;
    p: number = 1;
	constructor(private dataService:DataService,public authService:AuthService,private modalService: BsModalService) { }


	public openModal(template: TemplateRef<any>) {
		this.modalRef = this.modalService.show(template);
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
			})
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

}
