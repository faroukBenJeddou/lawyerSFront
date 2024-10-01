import { TestBed } from '@angular/core/testing';

import { HearingsService } from './hearings.service';

describe('HearingsService', () => {
  let service: HearingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HearingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
