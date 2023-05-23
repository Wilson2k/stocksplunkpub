import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isDevMode } from '@angular/core';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {
    if(isDevMode()) {
      this.rootURL = 'http://localhost:8080/api/';
    }
  }
  rootURL = '/api/';
  
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.rootURL + 'login', {
      email,
      password
    }, httpOptions);
  }

  register(fname: string, lname: string, email: string, password: string): Observable<any> {
    return this.http.post(this.rootURL + 'register', {
      fname,
      lname,
      email,
      password
    }, httpOptions);
  }
}