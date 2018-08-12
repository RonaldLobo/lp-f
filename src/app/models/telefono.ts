export class Telefono {
	id: number;
	idUsuario: number;
    telefono: string;
    estado:number;

    constructor(){
    	this.id = 0;
        this.telefono = '';
        this.estado = 1;
        this.idUsuario = 0;
    }

}