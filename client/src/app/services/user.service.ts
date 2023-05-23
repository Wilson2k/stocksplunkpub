import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isDevMode } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {
    if(isDevMode()) {
      this.rootURL = 'http://localhost:8080/api/';
    }
  }

  rootURL = '/api/';
  // Simple data for authorized pages
  getPublicContent(): Observable<any> {
    return this.http.get(this.rootURL , { responseType: 'text' });
  }
  getUserPage(): Observable<any> {
    return this.http.get(this.rootURL + 'user', { responseType: 'text' });
  }
  getAdminPage(): Observable<any> {
    return this.http.get(this.rootURL + 'admin', { responseType: 'text' });
  }
  // Get profile page information from server
  getProfilePage(): Observable<any> {
    return this.http.get(this.rootURL + 'user/profile', { responseType: 'text' });
  }
  // Update portfolio values
  updateProfilePage(): Observable<any> {
    return this.http.put(this.rootURL + 'user/profile', { responseType: 'text' });
  }
  // Buying stocks as user
  buyUserStock(ticker: string, volume: string): Observable<any> {
    return this.http.put(this.rootURL + 'user/buy/' + ticker + '?volume=' + volume, { responseType: 'text' });
  }
  // Selling stocks as user
  sellUserStock(ticker: string, volume: string): Observable<any> {
    return this.http.put(this.rootURL + 'user/sell/' + ticker + '?volume=' + volume, { responseType: 'text' });
  }
  // Adding cash to user's account
  addUserFunds(amount: string): Observable<any> {
    return this.http.put(this.rootURL + 'user/add?amount=' + amount, { responseType: 'text' });
  }
  // Removing cash from user's account
  removeUserFunds(amount: string): Observable<any> {
    return this.http.put(this.rootURL + 'user/remove?amount=' + amount, { responseType: 'text' });
  }
  // Get list of matching stocks from Alpha Vantage API
  getUserSearch(query: string): Observable<any> {
    return this.http.get(this.rootURL + 'stock/search?stock=' + query, { responseType: 'text' });
  }
  // Get live stock quote from Alpha Vantage API
  getStockQuote(query: string): Observable<any> {
    return this.http.get(this.rootURL + 'stock/quote?stock=' + query, { responseType: 'text' });
  }
  // Get stock information from Alpha Vanrage API
  getStockInfo(query: string): Observable<any> {
    return this.http.get(this.rootURL + 'stock/info?stock=' + query, { responseType: 'text' });
  }
}