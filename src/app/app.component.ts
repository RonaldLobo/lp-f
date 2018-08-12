import { Component ,OnInit, NgZone,Inject} from '@angular/core';
import { PushNotificationsService } from './services/push-notification.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	private _window: any;
	constructor(private ngZone: NgZone, private pushService:PushNotificationsService, private authService:AuthService) {
	}

	ngOnInit() {
		var that = this;
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if ( app ){
			that.ngZone.run(() => {
				this.pushService.initNotifications();
			});
		}
		setTimeout(function(){
			if(that.authService.loggedUser){
				if (that.authService.loggedUser.telefono.length == 0) {
					alert('Por Favor agregue su telefono');
				}
			}
		},2000);
	}

}
