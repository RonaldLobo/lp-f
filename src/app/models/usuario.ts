import { Correo } from '../models/correo';
import { Telefono } from '../models/telefono';

export class Usuario {
	id: number;
    usuario: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    correo: Correo[];
    telefono:Telefono[];
    contrasenna: string;
    rol: string;
    tiempoBarbero: number;
    tipo: string;
    servicios: any[];
    estado: number;
    idSucursal: number;
    horarios: any[];

    constructor(){
    	this.id = 0;
        this.idSucursal = 1;
        this.usuario = "";
    	this.nombre = "";
        this.apellido1 = "";
        this.apellido2 = "";
    	this.contrasenna = "";
        this.telefono = [];
    	this.rol = "";
        this.tipo = "N";
        this.estado = 1;
        this.correo = [];
        this.tiempoBarbero = 20;
        this.servicios = [];
        this.horarios = [];
    }

}