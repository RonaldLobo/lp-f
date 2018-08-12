import { Component,Output,EventEmitter } from '@angular/core';
 
@Component({
  selector: 'calendario-input',
  templateUrl: './calendario-input.component.html'
})
export class CalendarioInputComponent {
  minDate = new Date(2017, 5, 10);
  maxDate = new Date(2018, 9, 15);
  @Output() dateSelectedChange = new EventEmitter<any>();
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
 
  set bsValue(v: Date) {
    console.log(v);
    this.dateSelectedChange.emit(this.parseDate(v));
    this._bsValue = v;
  }

  public parseDate(date:any){
    var displayDate = "--";
    if(date){
      displayDate = date.getFullYear()+'-'+this.zerofill(date.getMonth(),1)+'-'+this.zerofill(date.getDate(),0)
    }
    return displayDate;
  }

  public zerofill(i,add) {
    i = i + add;
      return ((i < 10 ? '0' : '') + i);
  }
 
  log(v: any) {console.log(v);}
}