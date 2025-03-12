import { TestBed } from '@angular/core/testing';

import { MlServiceService } from './ml-service.service';

describe('MlServiceService', () => {
  let service: MlServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MlServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
