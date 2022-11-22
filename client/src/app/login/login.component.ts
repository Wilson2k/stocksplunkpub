import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input()
  initialState = new BehaviorSubject({ email: '', password: '' });

  @Output()
  formValuesChanged = new EventEmitter();

  @Output()
  formSubmitted = new EventEmitter();

  userForm: FormGroup = new FormGroup({});
  isLoggedIn = false;
  isLogInFail = false;
  errorMsg = '';
  roles: string[] = [];

  constructor(private fb: FormBuilder, private authService: AuthService, private tokenStorage: TokenStorageService) { }

  get email() { return this.userForm.get('email')!; }
  get password() { return this.userForm.get('password')!; }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    } else {
      this.initialState.subscribe(user => {
        this.userForm = this.fb.group({
          email: [user.email, [Validators.required, Validators.email]],
          password: [user.password, [Validators.required, Validators.minLength(8)]]
        });
      });

      this.userForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
    }
  }
  onSubmit(): void {
    const { email, password } = this.userForm.value;
    this.authService.login(email, password).subscribe({
      next: (data) => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.redirectProfile();
      },
      error: (err) => {
        console.log(err);
        this.errorMsg = err.error.message;
        this.isLogInFail = true;
      }
    });
  }

  redirectProfile(): void {
    setTimeout(function(){
      window.location.href="/";
    }, 1000);
  }
}