import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  message?: string;
  constructor(private userService: UserService) { }
  ngOnInit(): void {
    this.userService.getAdminPage().subscribe({
      next: (data) => {
        this.message = data;
      },
      error: (err) => {
        this.message = JSON.parse(err.error).message;
      }
    });
  }
}