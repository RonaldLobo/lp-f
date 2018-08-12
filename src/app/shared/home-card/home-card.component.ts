import { Component ,Input} from '@angular/core';

@Component({
  selector: 'home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.css']
})
export class HomeCardComponent{
	@Input() card: any;
	constructor() { }
}
