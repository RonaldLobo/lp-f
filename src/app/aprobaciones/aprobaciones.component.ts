import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Aceptacion } from '../models/aceptacion';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.component.html',
  styleUrls: ['./aprobaciones.component.css']
})
export class AprobacionesComponent implements OnInit {
	public aprobaciones : Aceptacion[]  = [];
	
	public p: number = 1;

  constructor(public dataService:DataService, public authService:AuthService, public router:Router) { }

  ngOnInit() {
  	var that = this;
	setTimeout(function(){
	  	that.dataService.get('/aprobacion?FkIdSucursalBarberiaAprobacion='+that.authService.loggedUser.idSucursal).then((res)=>{
	  		console.log(res);
	  		that.aprobaciones = res.aprobacion;
	  	});
	},2000);
  }

	verAceptacion(id){
		this.goTo('/aprobar/'+id);
	}

	goTo(url){
		this.router.navigate([url]);
	}

}
