import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';  
import { Usuario } from "../models/usuario";
import { DataService } from '../services/data.service';
import { SharedService } from '../services/shared.service';
import * as _ from "lodash";
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../services/auth.service';
import { ValidatorService } from "../services/validator.service"; 

@Component({
  selector: 'app-facturar',
  templateUrl: './facturar.component.html',
  styleUrls: ['./facturar.component.css']
})
export class FacturarComponent implements OnInit {
	public cargando: boolean = false;
	public buscaUsuario:string = "";
	public buscaCedula:string = "";
	public buscaProducto:string = "";
	public buscaCodigo:string = "";
	public usuarioCita: any = [];
	public productos: any = [];
    p: number = 1;


	constructor(private router:Router,private dataService:DataService, public authService:AuthService, public validatorService:ValidatorService, public sharedService:SharedService,private modalService: BsModalService) { }


	ngOnInit() {
	  }



	public buscaUsuarioChanged = _.debounce(function() {
		this.encontroUsuario = false;
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
}
