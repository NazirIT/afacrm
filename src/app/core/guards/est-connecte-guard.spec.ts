import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { estConnecteGuard } from './est-connecte-guard';

describe('estConnecteGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => estConnecteGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
