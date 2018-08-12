import { Component, OnInit,TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { AuthService } from "../services/auth.service"

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public modalRef: BsModalRef;
  public action: string = 'Login';
  constructor(private modalService: BsModalService,public authService:AuthService) {}
 
  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  ngOnInit() {
  }

  public logout(){
    this.authService.logout();
  }

  public hide(){
    this.modalRef.hide();
  }

  public updateAction(update){
    console.log('up',update);
    this.action = update;
  }
}
