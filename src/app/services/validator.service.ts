import { Injectable } from '@angular/core';


@Injectable()
export class ValidatorService {

    constructor() {
    }

    public validaUsuario(usuario, requiereContrasenna = true){
    	var errors = [];

    	if(!this.isNotNull(usuario.nombre)){
    		errors.push({
    			error:'nombre',
    			desc:'Por favor ingrese un nombre'
    		});
    	}
        if(!this.isNotNull(usuario.cedula)){
            errors.push({
                error:'cedula',
                desc:'Por favor ingrese una cédula'
            });
        }

        if((usuario.cedula.length < 9  || usuario.cedula.length > 9) && usuario.tipoCedula == '01'){
             errors.push({
                error:'cedula',
                desc:'La cédula es de tipo Fisica, por lo que debe ser de 9 digitos'
            });
        }

         if((usuario.cedula.length < 10  || usuario.cedula.length > 10) && usuario.tipoCedula == '02'){
             errors.push({
                error:'cedula',
                desc:'La cédula es tipo Jurídica, por lo debe ser igual a 10 digitos'
            });
        }

        if((usuario.cedula.length < 12  || usuario.cedula.length > 12) && usuario.tipoCedula == '03'){
             errors.push({
                error:'cedula',
                desc:'La cédula es tipo Dimex, por lo que debe ser igual a 12 digitos'
            });
        }
       
    	if(!this.isNotNull(usuario.usuario)){
    		errors.push({
    			error:'usuario',
    			desc:'Por favor ingrese un usuario'
    		});
    	}
    	if(!this.isNotNull(usuario.contrasenna) && requiereContrasenna){
    		errors.push({
    			error:'contrasenna',
    			desc:'Por favor ingrese una clave'
    		});
    	}
    	if(!this.isNotNull(usuario.apellido1) && usuario.tipoCedula=='01'){
    		errors.push({
    			error:'apellido1',
    			desc:'Por favor ingrese el primer apellido'
    		});
    	}
        if(!usuario.telefono){
            errors.push({
                error:'telefono',
                desc:'Por favor ingrese al menos un número de telefono'
            });
        } else if(usuario.telefono.length == 0){
            errors.push({
                error:'telefono',
                desc:'Por favor ingrese al menos un número de telefono'
            });
        }
        if(!usuario.correo){
            errors.push({
                error:'correo',
                desc:'Por favor ingrese al menos un correo'
            });
        } else if(usuario.correo.length == 0){
            errors.push({
                error:'correo',
                desc:'Por favor ingrese al menos un correo'
            });
        }
    	return errors;
    }

    public validaBarbero(barbero){
    	var errors = [];
    	errors = this.validaUsuario(barbero);
    	if(!this.isNotNull(barbero.tiempoBarbero) || !this.isNumeric(barbero.tiempoBarbero)){
    		errors.push({
    			error:'tiempoBarbero',
    			desc:'Por favor verifique el Tiempo Barbero'
    		});
    	}
    	return errors;
    }

    public validaServicio(servicio){
    	var errors = [];
    	if(!this.isNotNull(servicio.descripcion)){
    		errors.push({
    			error:'nombre',
    			desc:'Por favor ingrese un nombre'
    		});
    	}
    	if(!this.isNotNull(servicio.duracion) || !this.isNumeric(servicio.duracion)){
    		errors.push({
    			error:'duracion',
    			desc:'Por favor ingrese una duracion'
    		});
    	}
    	if(!this.isNotNull(servicio.precio) || !this.isNumeric(servicio.precio)){
    		errors.push({
    			error:'precio',
    			desc:'Por favor ingrese un precio'
    		});
    	}
    	return errors;
    }

    public validaBarberia(barberia){
    	var errors = [];
    	if(!this.isNotNull(barberia.descripcion)){
    		errors.push({
    			error:'descripcion',
    			desc:'Por favor ingrese un nombre'
    		});
    	}
    	if(!this.isNotNull(barberia.detalleDireccion)){
    		errors.push({
    			error:'detalleDireccion',
    			desc:'Por favor ingrese un detalle'
    		});
    	}
        if(!barberia.telefono){
            errors.push({
                error:'telefono',
                desc:'Por favor ingrese al menos un número de telefono'
            });
        } else if(barberia.telefono.length == 0){
            errors.push({
                error:'telefono',
                desc:'Por favor ingrese al menos un número de telefono'
            });
        }
        if(!barberia.correo){
            errors.push({
                error:'correo',
                desc:'Por favor ingrese al menos un correo'
            });
        } else if(barberia.correo.length == 0){
            errors.push({
                error:'correo',
                desc:'Por favor ingrese al menos un correo'
            });
        }
    	return errors;
    }
    
    public validaPausa(pausa){
    	var errors = [];
    	if(!this.isNotNull(pausa.horaInicial)){
    		errors.push({
    			error:'horaInicial',
    			desc:'Por favor ingrese una hora'
    		});
    	}
    	if(!this.isNotNull(pausa.duracion)){
    		errors.push({
    			error:'duracion',
    			desc:'Por favor ingrese una duracion'
    		});
    	}
    	if(!this.isNotNull(pausa.dia) && !this.isNotNull(pausa.fecha)){
    		errors.push({
    			error:'dia',
    			desc:'Por favor seleccione el dia para repetir'
    		});
    	}
    	return errors;
    }

    public isNotNull(value){
    	return (value)
    }

    public isNumeric(number) {
	  return !isNaN(parseFloat(number)) && isFinite(number);
	}

	public emailValid(email){
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	}

	public hasChars(text,number){
		text = text + '';
		return (text.length == number)
	}

	public hasError(error,errors){
		return (errors.find(o => o.error == error));
	}

    public getError(error,errors){
        let errorMsg = errors.find(o => o.error == error);
        return errorMsg.desc;
    }
}

