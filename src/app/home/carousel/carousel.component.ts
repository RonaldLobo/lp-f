import { Component ,Input} from '@angular/core';
import { AuthService } from "../../services/auth.service"

@Component({
  selector: 'carousel-custom',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent{
	public myInterval: number = 4000;
	constructor(public authService:AuthService) { }
}
