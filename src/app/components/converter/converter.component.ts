import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ExchangeRatesApiRequestService } from '../../shared/service/exchange-rates-api-request.service';
import { CurrencyExchangeService } from '../../shared/service/currency-convertor.service';
import { ExchangeRatesResponse, MappedCurrencyRateObject } from '../../shared/interface/exchange-rates.model';



import {
    Currency,
    FormNames,
    
} from '../../shared/interface/enums.model';
import getSymbolFromCurrency from 'currency-symbol-map';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

export interface Statistics {
    name: string;
    summary: number;
}

@Component({
    selector: 'app-converter',
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConverterComponent implements OnInit {
   

   
 

    public statisticalData: Statistics[];
   
   

 

    public converterForm: FormGroup;
    public filteredFromValues: Observable<string[]>;
    public filteredToValues: Observable<string[]>;

    public id: number = new Date().getTime();
    public amount: number;
    public fromRate: number;
    public fromCurrency: string;
    public toRate: number;
    public toCurrency: string;
    public result: string;

    private readonly FIRST_ITEM = 0;
    private readonly SECOND_ITEM = 1;
    private readonly THIRD_ITEM = 2;

    constructor(
        public currencyExchangeService: CurrencyExchangeService,
        private apiRequestService: ExchangeRatesApiRequestService,
        private translate: TranslateService,
    ) {
        
    }

    ngOnInit() {
        this.converterForm = this.currencyExchangeService.converterForm;

        this.disableInputAreas([FormNames.FromControl, FormNames.ToControl]);

        this.getRates();

        this.filteredFromValues = this.getFromValueChanges(FormNames.FromControl);

        this.filteredToValues = this.getToValueChanges(FormNames.ToControl);

      

       

      
    }

    selectCurrencyByEnter(event: MatOptionSelectionChange, inputName: string): void {
        if (event.isUserInput) {
            inputName = event.source.value;
        }
    }

    selectWrittenCurrency(event: any, inputName: string): void {
        const writtenCurrency = event.target.value.toUpperCase();

        if (writtenCurrency.length >= 2 && writtenCurrency.length <= 3) {
            const currencyList = this.mapItemCurrencies();

            const matchedCurrency = currencyList
                .filter((currency) => currency.includes(writtenCurrency))
                [this.FIRST_ITEM].toString();

            this.converterForm.controls[inputName].setValue(matchedCurrency);
        }
    }

    exchangeRates(): void {
        this.fromRate = this.filterSelectedValue(FormNames.FromControl).rate;
        this.fromCurrency = this.filterSelectedValue(FormNames.FromControl).currency;

        this.toRate = this.filterSelectedValue(FormNames.ToControl).rate;
        this.toCurrency = this.filterSelectedValue(FormNames.ToControl).currency;

        this.amount = Math.floor(this.converterForm.get(FormNames.AmountControl).value);

        this.result = this.calculateExchangeRate();

        this.incrementNumberForID();

       

     

      
        

       

       
    }

    changeExchangeInputValues(): void {
        this.converterForm = new FormGroup({
            amountControl: new FormControl(this.converterForm.get(FormNames.AmountControl).value, [
                Validators.required,
            ]),
            fromControl: new FormControl(this.converterForm.get(FormNames.ToControl).value, [
                Validators.required,
                Validators.minLength(2),
            ]),
            toControl: new FormControl(this.converterForm.get(FormNames.FromControl).value, [
                Validators.required,
                Validators.minLength(2),
            ]),
        });

        this.incrementNumberForID();

        this.currencyExchangeService.fromCurrencies = this.mapItemCurrencies();

        this.currencyExchangeService.toCurrencies = this.mapItemCurrencies();

        this.filteredFromValues = this.getFromValueChanges(FormNames.FromControl);

        this.filteredToValues = this.getToValueChanges(FormNames.ToControl);
    }

    filterSelectedValue(value: string): MappedCurrencyRateObject {
        return this.currencyExchangeService.exchangeRates.filter((item: MappedCurrencyRateObject) => {
            return item.currency === this.converterForm.get(value).value;
        })[this.FIRST_ITEM];
    }

    mapItemCurrencies(): string[] {
        return this.currencyExchangeService.exchangeRates
            .map((currencyItem: MappedCurrencyRateObject) => {
                return currencyItem.currency;
            })
            .sort();
    }

    mapResponseData(responseData: ExchangeRatesResponse): MappedCurrencyRateObject[] {
        return Object.keys(responseData.rates).map(
            (item: string): MappedCurrencyRateObject => {
                return {
                    currency: item,
                    rate: responseData.rates[item],
                };
            },
        );
    }

    getFromValueChanges(stringValue: string): Observable<string[]> {
        return this.converterForm.get(stringValue).valueChanges.pipe(
            startWith(''),
            map((value) => this.filterInputValue(value, this.currencyExchangeService.fromCurrencies)),
        );
    }

    getToValueChanges(stringValue: string): Observable<string[]> {
        return this.converterForm.get(stringValue).valueChanges.pipe(
            startWith(''),
            map((value) => this.filterInputValue(value, this.currencyExchangeService.toCurrencies)),
        );
    }

  

   

    calculateExchangeRate(): string {
        return ((this.converterForm.get(FormNames.AmountControl).value * this.toRate) / this.fromRate).toFixed(3);
    }

    incrementNumberForID(): number {
        return (this.id += 1);
    }

   

    

    

   

    getRates(): void {
        if (
            this.currencyExchangeService.exchangeRates === undefined ||
            this.currencyExchangeService.exchangeRates.length <= 0
        ) {
            this.apiRequestService.getExchangeRates(Currency.USD).subscribe(
                (exchangeRate: ExchangeRatesResponse): void => {
                    this.currencyExchangeService.exchangeRates = this.mapResponseData(exchangeRate);

                    this.currencyExchangeService.fromCurrencies = this.mapItemCurrencies();

                    this.currencyExchangeService.toCurrencies = this.mapItemCurrencies();

                    this.enableInputAreas([FormNames.FromControl, FormNames.ToControl]);
                },
                (error): void => {
                    alert('Error: ${error.message}');
                },
            );
        } else {
            this.enableInputAreas([FormNames.FromControl, FormNames.ToControl]);
        }
    }

    

    
   

    disableInputAreas(inputNames: string[]): void {
        for (let inputName of inputNames) {
            this.converterForm.controls[inputName].disable();
        }
    }

    enableInputAreas(inputNames: string[]): void {
        for (let inputName of inputNames) {
            this.converterForm.controls[inputName].enable();
        }
    }

    getSymbol(rate: string): string {
        return getSymbolFromCurrency(rate);
    }

    private filterInputValue(value: string, arrayGoingFiltered: string[]): string[] {
        const filterValue = value.toLowerCase();

        return arrayGoingFiltered.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
