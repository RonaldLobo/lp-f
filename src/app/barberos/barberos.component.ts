import { Component, OnInit , Output, Input, EventEmitter,OnChanges} from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-barberos',
  templateUrl: './barberos.component.html',
  styleUrls: ['./barberos.component.css']
})
export class BarberosComponent implements OnInit , OnChanges{
	@Input() barberiaSelected: any;
	@Input() isRegularUser:any ;
	@Output() selectBarberDone : EventEmitter<any> = new EventEmitter();

	public selectedBarber:any = '';
	public selectedServicio:any = '';
	public barberos:any = [];
	public obteniendoBarberos = false;
	public tiempos:any = [];


	constructor(private router:Router, private dataService:DataService) { }

	ngOnInit() {
	}

	ngOnChanges(changes) {
		if(changes.barberiaSelected.currentValue != 0){
			this.obteniendoBarberos = true;
			this.barberos = [];
			this.selectedBarber = {};
	    	this.dataService.get('/usuario/?idSucursal='+changes.barberiaSelected.currentValue)
	            .then(response => {
	            	this.obteniendoBarberos = false;
	                this.barberos = response.usuario;
	                if(this.barberos.length == 1){
	                	this.selectedBarber = this.barberos[0];
	                	if(this.selectedBarber.servicios.length == 1){
	                		this.selectedServicio = this.selectedBarber.servicios[0];
	                		this.selectBarberDone.emit({'servicio':this.selectedServicio,'barber':this.selectedBarber});
	                	}
	                	let veces = 1;
	                	this.tiempos = [];
			    		while(veces < 20){
			    			this.tiempos.push(this.selectedBarber.tiempoBarbero * veces);
			    			veces++;
			    		}
	                }
	                if(this.barberos.length == 0){
	                	this.selectedBarber = '';
	                }
	            },
	            error => {
	            })
        } else {
        	this.barberos = [];
        	this.selectedBarber = '';
        }
  	}

	public selectBarber(barber:any){
		this.selectedBarber = barber;
		if(this.selectedBarber.servicios.length == 1){
    		this.selectedServicio = this.selectedBarber.servicios[0];
    		// this.selectBarberDone.emit({'servicio':this.selectedServicio,'barber':this.selectedBarber});
    	}
    	let veces = 1;
    	this.tiempos = [];
		while(veces < 20){
			this.tiempos.push(this.selectedBarber.tiempoBarbero * veces);
			veces++;
		}
	}

	public selectServicio(servicio:any, dinamico){
		this.selectedServicio = servicio;
		let valid = true;
		if(dinamico){
			valid = false;
			if(isNaN(this.selectedServicio.precioDinamico)){
				alert('Revise el precio del Servicio.');
			} else if(isNaN(this.selectedServicio.duracionDinamica)){
				alert('Revise la duración del Servicio.');
			} else if(this.selectedServicio.descripcionDinamica == '' || this.selectedServicio.descripcionDinamica == undefined || this.selectedServicio.descripcionDinamica == null){
				alert('Revise la descripción del Servicio.');
			} else{
				valid=true;
				this.selectedServicio.precio = this.selectedServicio.precioDinamico;
				this.selectedServicio.descripcion = this.selectedServicio.descripcionDinamica;
				this.selectedServicio.duracion = this.selectedServicio.duracionDinamica;
			}
		}
		if((!this.selectedServicio.esDinamico || dinamico) && valid){
			this.selectBarberDone.emit({'servicio':this.selectedServicio,'barber':this.selectedBarber,'changed':true});
		}
	}

	public confirmar(){
		//this.router.navigate(['results']);
	}

	public isFB(usuario){
		return !isNaN(usuario);
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
