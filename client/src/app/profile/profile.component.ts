import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { FormControl } from '@angular/forms';
import { UserService } from '../services/user.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  addAmount = new FormControl('', {updateOn: 'blur'});
  removeAmount = new FormControl('', {updateOn: 'blur'});
  message?: string;
  currentUser?: any;
  currentUserPortfolio?: any;
  validUser = false;

  constructor(private token: TokenStorageService, private userService: UserService, private currencyPipe: CurrencyPipe) { }

  ngOnInit(): void {
    const user = this.token.getUser();
    if (Object.keys(user).length !== 0) {
      this.validUser = true;
      this.updatePortfolio();
      this.getPortfolio();
    } else {
      this.message = "Please login.";
      this.validUser = false;
    }
  }
  updatePortfolio(): void {
    if (this.validUser) {
      this.userService.updateProfilePage().subscribe({
        next: (data) => {
        },
        error: (err) => {
          this.message = err.error.message;
        }
      });
    }
  }
  getPortfolio(): void {
    if (this.validUser) {
      this.userService.getProfilePage().subscribe({
        next: (data) => {
          this.currentUser = JSON.parse(data);
          this.currentUserPortfolio = this.currentUser.portfolio;
        },
        error: (err) => {
          console.log(err)
          this.message = err.error.message;
        }
      });
    }
  }
  addFunds(): void {
    const amountNum = this.addAmount.value!;
    if (this.validUser) {
      this.userService.addUserFunds(amountNum).subscribe({
        next: (data) => {
          const amountAdded = this.currencyPipe.transform(data.credited,'USD', '$', '1.2-2');
          this.message = `Successfully added ${amountAdded} to account!`;
          this.updatePortfolio();
        },
        error: (err) => {
          this.message = err.error.message;
        }
      });
    }
  }
  removeFunds(): void {
    const amountNum = this.removeAmount.value!;
    if (this.validUser) {
      this.userService.removeUserFunds(amountNum).subscribe({
        next: (data) => {
          const amountRemoved = this.currencyPipe.transform(data.removed,'USD', '$', '1.2-2');
          this.message = `Successfully removed ${amountRemoved} from account!`;
          this.updatePortfolio();
        },
        error: (err) => {
          this.message = err.error.message;
        }
      });
    }
  }
  transformAddInput(){
    const transformValue = this.currencyPipe.transform(this.addAmount.value,'USD', '', '1.2-2');
    if(transformValue){
      const data = transformValue!.replace(/,/g, "");
      this.addAmount.setValue(data);
    }
  }
  transformRemoveInput(){
    const transformValue = this.currencyPipe.transform(this.removeAmount.value,'USD', '', '1.2-2');
    if(transformValue){
      const data = transformValue!.replace(/,/g, "");
      this.removeAmount.setValue(data);
    }
  }
  redirectProfile(): void {
    setTimeout(function(){
      window.location.reload();
    }, 1000);
  }
}