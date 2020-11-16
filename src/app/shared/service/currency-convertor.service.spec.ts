import { TestBed, inject, async } from '@angular/core/testing';
import { CurrencyExchangeService } from './currency-convertor.service';

describe('CurrencyExchangeService', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [CurrencyExchangeService],
        });
    }));

    it('should be created', inject([CurrencyExchangeService], (service: CurrencyExchangeService) => {
        expect(service).toBeTruthy();
    }));
});
