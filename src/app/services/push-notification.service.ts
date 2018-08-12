import { Injectable } from '@angular/core';
import { WindowRefService } from './window.service';
import { Router } from '@angular/router';

@Injectable()
export class PushNotificationsService {

	public pushService: any;
	private _window: any;
	public isApp:any;

	constructor(private windowRef: WindowRefService, private router:Router){
		this._window = windowRef.nativeWindow;
		this.isApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	}

	initNotifications(){
		if(this.isApp){
			this.pushService = this._window.PushNotification.init({
			    android: {
			        senderID: 709132659673
			    }
			});
			this.pushService.subscribe('all', () => {
					console.log('success subscribe all');
				}, (e) => {
					console.log('error:'+ e);
				});

			this.pushService.on('notification',(data) => {
			  this.router.navigateByUrl('/info')
			});
		}
	}

	agregarTema(tema){
		if(this.isApp){
			this.pushService.subscribe(tema, () => {
					console.log('success subscribe '+tema);
				}, (e) => {
					console.log('error:'+ e);
				});
		}
	}

	eliminarTema(tema){
		if(this.isApp){
			this.pushService.unsubscribe(tema, () => {
					console.log('success unsubscribe '+tema);
				}, (e) => {
					console.log('error:'+ e);
				});
		}
	}

}