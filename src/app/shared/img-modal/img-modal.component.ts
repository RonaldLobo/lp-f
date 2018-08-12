import { Component,Input, OnInit } from '@angular/core';

@Component({
  selector: 'img-modal',
  templateUrl: './img-modal.component.html',
  styleUrls: ['./img-modal.component.css']
})
export class ImgModalComponent implements OnInit {
	@Input() name: any;
  constructor() { }

  ngOnInit() {
  }

}
