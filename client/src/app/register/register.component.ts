import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Input()
  initialState = new BehaviorSubject({fname: '', lname: '', email: '', password: ''});
  
  @Output()
  formValuesChanged = new EventEmitter();
  
  @Output()
  formSubmitted = new EventEmitter();
  
  userForm: FormGroup = new FormGroup({});
  isRegistered = false;
  isRegisterFail = false;
  errorMsg = '';
  successMsg = '';
  
  constructor(private fb: FormBuilder, private authService: AuthService) { }
  
  get fname() { return this.userForm.get('fname')!; }
  get lname() { return this.userForm.get('lname')!; }
  get email() { return this.userForm.get('email')!; }
  get password() { return this.userForm.get('password')!; }
  
  ngOnInit() {
    this.initialState.subscribe(user => {
      this.userForm = this.fb.group({
        fname: [ user.fname, [Validators.required, Validators.minLength(3)] ],
        lname: [ user.lname, [Validators.required, Validators.minLength(3)] ],
        email: [ user.email, [Validators.required, Validators.email] ],
        password: [user.password, [Validators.required, Validators.minLength(8)]]
      });
    });
  
    this.userForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  onSubmit(): void {
    const { fname, lname, email, password } = this.userForm.value;
    this.authService.register(fname, lname, email, password).subscribe({
      next: (data) => {
        this.successMsg = data.message;
        this.isRegistered = true;
        this.isRegisterFail = false;
        this.redirectLogin();
      },
      error: (err) => {
        console.log(err);
        this.errorMsg = err.error.message;
        this.isRegisterFail = true;
      }
    });
  }

  redirectLogin(): void {
    setTimeout(function(){
      window.location.href="/login"
    }, 1000);
  }
}