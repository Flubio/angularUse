import { TestBed } from '@angular/core/testing';

import { CreateGlobalState } from './create-global-state';

describe('CreateGlobalState', () => {
  let service: CreateGlobalState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateGlobalState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
