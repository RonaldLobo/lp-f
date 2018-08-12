export class Correo {
	id: number;
	idUsuario: number;
    correo: string;
    estado:number;

    constructor(){
    	this.id = 0;
    	this.idUsuario = 0;
        this.correo = '';
        this.estado = 1;
    }

}