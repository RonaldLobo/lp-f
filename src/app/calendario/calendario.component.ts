import { Component, OnInit, Input,Output,EventEmitter } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/es';  
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-calendario',
	templateUrl: './calendario.component.html',
	styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
	@Input() dateSelected: any;
	@Output() dateSelectedChange = new EventEmitter<any>();
	public dt: Date = new Date();
	public minDate: Date = new Date();
	public events: any[];
	public tomorrow: Date;
	public afterTomorrow: Date;
	public dateDisabled: {date: Date, mode: string}[];
	public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY','shortDate'];
	public format: string = this.formats[0];
	public dateOptions: any = {
		formatYear: 'YY',
		startingDay: 1,
		showWeeks: false,
		locale:'es'
	};
	private opened: boolean = false;

	public constructor(private authService:AuthService) {
		(this.tomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
		(this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 2);
		if(this.authService.isAdminSucursalUser()){
			(this.minDate = null);
		} else {
			(this.minDate = new Date()).setDate(this.minDate.getDate());
		}
		(this.dateDisabled = []);
		this.events = [
		{date: this.tomorrow, status: 'full'},
		{date: this.afterTomorrow, status: 'partially'}
		];
		moment.locale('es');
	}

	public getDate(): number {
		return this.dt && this.dt.getTime() || new Date().getTime();
	}

	public today(): void {
		this.dt = new Date();
	}

	public d20090824(): void {
		this.dt = moment('2009-08-24', 'YYYY-MM-DD')
		.toDate();
	}

	public disableTomorrow(): void {
		this.dateDisabled = [{date: this.tomorrow, mode: 'day'}];
	}

	// todo: implement custom class cases
	public getDayClass(date: any, mode: string): string {
		if (mode === 'day') {
			let dayToCheck = new Date(date).setHours(0, 0, 0, 0);

			for (let event of this.events) {
				let currentDay = new Date(event.date).setHours(0, 0, 0, 0);

				if (dayToCheck === currentDay) {
					return event.status;
				}
			}
		}

		return '';
	}



	public disabled(date: Date, mode: string): boolean {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	}

	public open(): void {
		this.opened = !this.opened;
	}

	public clear(): void {
		this.dt = void 0;
		this.dateDisabled = undefined;
	}

	public toggleMin(): void {
		this.dt = new Date(this.minDate.valueOf());
	}

	public dateChanged(date:any): void {
		this.dateSelectedChange.emit(date);
	}

	ngOnInit() {
		moment.locale('es');
		if(this.dateSelected){
			this.dt = new Date(this.dateSelected);
		}
	}

}
