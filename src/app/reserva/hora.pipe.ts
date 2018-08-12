import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatHora'})
export class FormatHoraPipe implements PipeTransform {
  transform(value: string): string {
    //let hora = (Number(value) > 12) ? (Number(value) - 12 ) + " pm": value + "am";
    console.log('value',value, Number(value));
    let hora = "";
    if(Number(value) > 1200){
    	hora = (Number(value) - 1200) + " pm"
    } else {
    	hora = value + " am"
    }
    return hora;
  }
}