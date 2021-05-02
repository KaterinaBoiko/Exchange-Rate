import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRatesComponent } from './all-rates.component';

describe('AllRatesComponent', () => {
  let component: AllRatesComponent;
  let fixture: ComponentFixture<AllRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllRatesComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
