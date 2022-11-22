import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Input()
  initialState = new BehaviorSubject({ principal: '', pmt: '', r: '', t: '' });

  @Output()
  formValuesChanged = new EventEmitter();

  @Output()
  formSubmitted = new EventEmitter();

  calculatorForm: FormGroup = new FormGroup({});
  validUser = false;
  total?: number;
  years?: number;

  constructor(private token: TokenStorageService, private fb: FormBuilder) { }

  get principal() { return this.calculatorForm.get('principal')!; }
  get pmt() { return this.calculatorForm.get('pmt')!; }
  get r() { return this.calculatorForm.get('r')!; }
  get t() { return this.calculatorForm.get('t')!; }

  ngOnInit(): void {
    const user = this.token.getUser();
    const numberRegexp =  "^[-]?([0-9]+\\.?[0-9]*|\\.[0-9]+)$";
    if (Object.keys(user).length !== 0) {
      this.validUser = true;
      this.initialState.subscribe(user => {
        this.calculatorForm = this.fb.group({
          principal: [user.principal, [Validators.required, Validators.min(0.01), Validators.pattern(numberRegexp)]],
          pmt: [user.pmt, [Validators.required, Validators.min(0.01), Validators.pattern(numberRegexp)]],
          r: [user.r, [Validators.required, Validators.min(0.01), Validators.pattern(numberRegexp)]],
          t: [user.t, [Validators.required, Validators.min(1), Validators.pattern("^[-]?([0-9]+)$")]]
        });
      });
      this.calculatorForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
    } else {
      this.validUser = false;
    }
  }
  calculateInvestment(): void {
    const P = parseFloat(this.principal.value);
    const PMT = parseFloat(this.pmt.value);
    const R = parseFloat(this.r.value) * 0.01;
    const T = parseFloat(this.t.value);
    const N = 12;
    const compoundInterest = P * (1 + (R/N))**(N*T);
    const futureVal = PMT * (((1 + (R/N))**(N*T)) - 1) / (R/N);
    this.total = compoundInterest + futureVal;
    this.years = T;
  }
  goToRegister(): void {
    setTimeout(function(){
      window.location.href="register";
    }, 1000);
  }
}