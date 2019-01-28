import { Injectable } from '@angular/core';
import { 
    Headers, 
    Http, 
    RequestOptions, 
    URLSearchParams, 
    Response, 
    ResponseContentType 
} from '@angular/http';
import { AuthService } from './auth.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

    public token:any = '';
    // public server:string = "http://localhost:82/API/index.php"
    public server:string = "/API/index.php"
    // public server:string = "http://los-peluqueros.herokuapp.com/API/index.php";


    constructor(
        public http: Http
    ) {
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if ( app ) {
            this.server = "http://los-peluqueros.herokuapp.com/API/index.php";
        }
    }

    public search(url: string, element: any): Observable<any> {
        let options: RequestOptions;
        let params: URLSearchParams;

        params = new URLSearchParams();

        for (let key in element) {
            if (element.hasOwnProperty(key)) {
                params.set(key, element[key])
            }
        }

        options = new RequestOptions({search: params});
        return this.http.get(this.server+url, options)
            .map(response => response.json());
    }


    public post(url: string, element: any): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.token);

        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.server+url, JSON.stringify(element),options)
            .toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }

    public postFile(url: string, element: any): Promise<any> {
        return this.http.post(this.server+url, JSON.stringify(element), { responseType: ResponseContentType.Blob })
            .toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }

    public getAll(url: string): Promise<any[]> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.token);

        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.server+url,options)
            .toPromise()
            .then(response => response.json() as any[])
            .catch(this.handleError);
    }

    public get(url: string): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.token);

        let options = new RequestOptions({ headers: headers });
        return this.http.get(this.server+url,options)
            .toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }

    public delete(url: string): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', this.token);

        let options = new RequestOptions({ headers: headers });
        return this.http.delete(this.server+url,options)
            .toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }

    public setToken(token){
        this.token = 'Bearer '+token;
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}