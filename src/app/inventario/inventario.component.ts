import { Component, OnInit,TemplateRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { SharedService } from '../services/shared.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { ValidatorService } from "../services/validator.service"; 
import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import * as _ from "lodash";

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
	public modalRef: BsModalRef;
	public printRefCompletar: BsModalRef;
	public productos: any = [];
	public nuevoProducto:any = {};
	public selectedInventario:any = {};
	//public nuevoInventario:Inventario = new Inventario();
	public inventarioErrores : any = [];
	public validationError: boolean = false;
	public nuevoInventarioError: boolean = false;
	public cargando: boolean = false;
	public posiblesProductos : any = [];
	public encontroInventario: boolean = true;
	public ver: boolean = true;
	public buscaProducto:string = "";
	public buscaCodigo:string = "";
	public productoBusqueda: any = [];
	p: number = 1;

 constructor(private dataService:DataService,
		public authService:AuthService,
		private modalService: BsModalService, 
		private sharedService: SharedService, 
		private decimalPipe:DecimalPipe,
		private datePipe:DatePipe,
		public validatorService:ValidatorService,
		private router:Router) { 
	}

	public openModal(template: TemplateRef<any>) {
		this.encontroInventario = true;
		this.modalRef = this.modalService.show(template);
	}

	public openModalPrint(template: TemplateRef<any>) {
		console.log('encontroInventario',this.encontroInventario);
		this.modalRef = this.modalService.show(template);

	}


  ngOnInit() {
  		var that = this;
  			setTimeout(function(){
		  		that.dataService.get('/inventario?idSucursal='+that.authService.loggedUser.idSucursal)
					.then(response => {
						console.log('inventario ',response.inventario);
						that.productos = response.inventario;
					},
					error => {
					});
		},2000);
  }


    public newInventario(){
    	var that = this;
    	that.cargando = true;
		that.nuevoProducto.idSucursal = that.authService.loggedUser.idSucursal;
		console.log('inventario ',that.nuevoProducto);
        that.dataService.post('/inventario/', {'inventario':that.nuevoProducto})
         .then(response => {
         	alert('Información registrada');
         	this.encontroInventario = false;
         	this.nuevoProducto = {};
         	this.cargando = false;
         	this.modalRef.hide();
        },
         error => {
         	this.cargando = false;
    	});
	
		
	}


	public updateInventario(){
		var that = this;
		that.cargando = true;
		that.nuevoProducto.idSucursal = that.authService.loggedUser.idSucursal;
		that.dataService.post('/inventario/?method=put', {'inventario':that.nuevoProducto})
            .then(response => {
            	alert('Información actualizada');
				this.encontroInventario = false;
				this.nuevoProducto = {};
            	this.cargando = false;
         		this.modalRef.hide();
            },
            error => {
            	this.cargando = false;
        });
        
	}


	public deleteInventario(){
		console.log('nuevoProducto',this.nuevoProducto);
		this.cargando = true;
		this.dataService.delete('/inventario/'+this.nuevoProducto.id)
            .then(response => {
            	alert('Información Eliminada');
            	this.cargando = false;
            	this.dataService.get('/inventario?idSucursal='+this.authService.loggedUser.idSucursal)
					.then(response => {
						console.log('inventario ',response.inventario);
						this.productos = response.inventario;
					},
				error => {
				});
            },
            error => {
            	alert('Información Eliminada');
            	this.cargando = false;
        });
        
	}


	public buscaProductoChanged = _.debounce(function() {
		this.encontroInventario = false;

		if(this.buscaProducto.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/inventario/?producto='+this.buscaProducto+'&idSucursal='+this.productos[0].idSucursal)
	        .then(response => {
	            this.productos = response.inventario;
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaProducto){
	    	this.dataService.get('/inventario?idSucursal='+this.authService.loggedUser.idSucursal)
					.then(response => {
						console.log('inventario ',response.inventario);
						this.productos = response.inventario;
					},
					error => {
					});
	    }
	}, 400);


	public buscaCodigoChanged = _.debounce(function() {
		this.encontroInventario = false;

		if(this.buscaCodigo.length >= 3){
		    this.cargando = true;
		    this.dataService.get('/inventario/?codigo='+this.buscaCodigo+'&idSucursal='+this.productos[0].idSucursal)
	        .then(response => {
	            this.productos = response.inventario;
				this.cargando = false;
	        },
	        error => {
	        })
	    } else if(!this.buscaCodigo){
			this.dataService.get('/inventario?idSucursal='+this.authService.loggedUser.idSucursal)
					.then(response => {
						console.log('inventario ',response.inventario);
						this.productos = response.inventario;
					},
					error => {
					});
	    }
	}, 400);



	public seleccionarInventarios(inventario){
		this.nuevoProducto = inventario;
		this.encontroInventario=true;
		this.productos = [];
		console.log(inventario);
	}


}
