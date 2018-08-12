import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}


let bootstrap = () => {
	platformBrowserDynamic().bootstrapModule(AppModule);
};
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( app ) {
	document.addEventListener('deviceready',()=>{
		bootstrap();
	});
}else{
	bootstrap();
}



// platformBrowserDynamic().bootstrapModule(AppModule);
