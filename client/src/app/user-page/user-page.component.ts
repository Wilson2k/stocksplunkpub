import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent implements OnInit {
  message?: string;
  searchResults?: any;
  validUser = false;
  constructor(private userService: UserService) { }
  ngOnInit(): void {
    this.userService.getUserPage().subscribe({
      next: (data) => {
        this.validUser = true;
      },
      error: (err) => {
        this.message = JSON.parse(err.error).message;
        this.validUser = false;
      }
    });
  }
  getSearchResults(query: string) {
    if(this.validUser){
      if(typeof query === 'string' && query.trim().length === 0){
        this.searchResults = [];
      } else {
        this.userService.getUserSearch(query).subscribe({
          next: (data) => {
            this.searchResults = JSON.parse(data);
          },
          error: (err) => {
            this.message = JSON.parse(err.error).message;
          }
        });
      }
    }
  }
}