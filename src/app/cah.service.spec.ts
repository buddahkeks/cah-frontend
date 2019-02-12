import { TestBed } from '@angular/core/testing';

import { CahService } from './cah.service';

describe('CahService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CahService = TestBed.get(CahService);
    expect(service).toBeTruthy();
  });
});
