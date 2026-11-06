import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableauBord } from './tableau-bord';

describe('TableauBord', () => {
  let component: TableauBord;
  let fixture: ComponentFixture<TableauBord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauBord],
    }).compileComponents();

    fixture = TestBed.createComponent(TableauBord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
