import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { FormControl } from '@angular/forms';
import { TokenStorageService } from '../services/token-storage.service';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrls: ['./stock-page.component.css']
})
export class StockPageComponent implements OnInit {
  buyAmount = new FormControl('', {updateOn: 'blur'});
  sellAmount = new FormControl('', {updateOn: 'blur'});
  message?: string;
  validUser = false;
  ticker = this.route.snapshot.paramMap.get('ticker')!;
  stockInfo?: any;
  stockQuote?: any;
  stockPrice?: number;
  currentUser?: any;
  currentUserPortfolio?: any;
  currentUserInvested = false;
  currentUserShares = 0;
  maxBuyableShares?: number;
  tradeBuyValue?: number;
  tradeSellValue?: number;
  constructor(private token: TokenStorageService, private userService: UserService, private route: ActivatedRoute, private decimalPipe: DecimalPipe) { }
  ngOnInit(): void {
    const user = this.token.getUser();
    if (Object.keys(user).length !== 0) {
      this.validUser = true;
      this.getPortfolio();
    } else {
      this.message = "Please login.";
      this.validUser = false;
    }
  }
  getPortfolio = () => {
    if (this.validUser) {
      this.userService.getProfilePage().subscribe({
        next: (data) => {
          this.currentUser = JSON.parse(data);
          this.currentUserPortfolio = this.currentUser.portfolio;
          // Calculate the max number of shares they can buy
          // Check if user has any shares
          if(Array.isArray(this.currentUserPortfolio) && this.currentUserPortfolio.length){
            this.currentUserPortfolio.forEach((stock) => {
              if(stock.ticker.toLowerCase() === this.ticker){
                this.currentUserInvested = true;
                this.currentUserShares = stock.shares;
              }
            });
          }
          this.getStockInfo(this.ticker);
          this.getStockQuote(this.ticker);
        },
        error: (err) => {
          this.message = JSON.parse(err.error).message;
        }
      });
    }
  }
  getStockQuote(stock: string): void {
    if (this.validUser) {
      if (typeof stock === 'string' && stock.trim().length === 0) {
        this.stockQuote = {};
      } else {
        this.userService.getStockQuote(stock).subscribe({
          next: (data) => {
              const stockData = JSON.parse(data);
              if(Object.keys(stockData).length !== 0){
                this.stockQuote = {price: stockData['05. price']};
                this.stockPrice = parseFloat(stockData['05. price']);
                this.maxBuyableShares = Math.floor(parseFloat(this.currentUser.cash) / parseFloat(stockData['05. price']));
              } else {
                this.message = "Error stock not found"
                setTimeout(() => {
                  window.location.href="/home";
                }, 1000);
              }
          },
          error: (err) => {
            this.message = JSON.parse(err.error).message;
          }
        });
      }
    }
  }
  getStockInfo(stock: string): void {
    if (this.validUser) {
      if (typeof stock === 'string' && stock.trim().length === 0) {
        this.stockInfo = {};
      } else {
        this.userService.getStockInfo(stock).subscribe({
          next: (data) => {
              const stockData = JSON.parse(data);
              if(Object.keys(stockData).length !== 0){
                this.stockInfo = {name: stockData['Name'], description: stockData['Description']};
              } else {
                this.stockInfo = {};
              }
          },
          error: (err) => {
            this.message = JSON.parse(err.error).message;
          }
        });
      }
    }
  }
  buyStock(): void {
    const amount = this.buyAmount.value!;
    if (this.validUser) {
      this.userService.buyUserStock(this.ticker!, amount).subscribe({
        next: (data) => {
        },
        error: (err) => {
          this.message = err.error.message;
        }
      });
      this.refreshPge();
    }
  }
  sellStock(): void {
    const amount = this.sellAmount.value!;
    if (this.validUser) {
      this.userService.sellUserStock(this.ticker!, amount).subscribe({
        next: (data) => {
        },
        error: (err) => {
          this.message = err.error.message;
        }
      });
      this.refreshPge();
    }
  }
  transformBuyInput(){
    const transformValue = this.decimalPipe.transform(this.buyAmount.value, '1.0-0');
    this.tradeBuyValue = parseInt(transformValue!) * parseFloat(this.stockQuote.price);
    if(transformValue){
      const data = transformValue!.replace(/,/g, "");
      this.buyAmount.setValue(data);
    }
  }
  transformSellInput(){
    const transformValue = this.decimalPipe.transform(this.sellAmount.value, '1.0-0');
    this.tradeSellValue = parseInt(transformValue!) * parseFloat(this.stockQuote.price);
    if(transformValue){
      const data = transformValue!.replace(/,/g, "");
      this.sellAmount.setValue(data);
    }
  }
  refreshPge(): void {
    setTimeout(function(){
      window.location.reload();
    }, 1000);
  }
}
