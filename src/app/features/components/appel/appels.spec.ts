import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Appels } from './appels';

describe('Appels', () => {
  let component: Appels;
  let fixture: ComponentFixture<Appels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Appels],
    }).compileComponents();

    fixture = TestBed.createComponent(Appels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
