export class Aceptacion {
	public pkIdAceptacion: number = 0;
	public detalle_mensaje: string = '';
	public mensaje: string = '';
	public fecha_emision_doc: string = '';
	public monto_total_impuesto: string = '';
	public numero_cedula_emisor: string = '';
	public numero_cedula_receptor: string = '';
	public tipo_cedula_emisor: string = '';
	public tipo_cedula_receptor: string = '';
	public total_factura: string = '';
	public FkIdSucursalBarberiaAprobacion: number = 0;
	public cliente: string = '';
	public clave: string = '';
	public claveAprobacion: string = '';
	public refresh: string = '';
	public estado: string = 'pendiente';
	public nombre_emisor: string = ''; 
	constructor(){
		
	}
}
