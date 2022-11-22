import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from './services/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title='StockSplunk';
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminPage = false;
  constructor(private tokenStorageService: TokenStorageService) { }
  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roles = user.roles;
      this.showAdminPage = this.roles.includes('ROLE_ADMIN');
    }
  }
  logout(): void {
    this.tokenStorageService.signOut();
    window.location.href="/home";
  }
}
