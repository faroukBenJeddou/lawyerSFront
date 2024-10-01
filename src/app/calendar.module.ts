import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {CalendarA11y, CalendarDateFormatter, DateAdapter} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule, FlatpickrDefaults } from 'angularx-flatpickr';
import { CalendarUtils } from 'angular-calendar'; // Import CalendarUtils
import { CalendarModule} from 'angular-calendar';
@NgModule({
  declarations: [
    // other components
  ],
  imports: [
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    FlatpickrModule.forRoot(),
    // other modules
  ],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CalendarDateFormatter, // Use default formatter or your own
    },
    {
      provide: FlatpickrDefaults,
      useValue: {
        wrap: true,
        dateFormat: 'Y-m-d',
        enableTime: true,
      },
    },
  ],
  bootstrap: [AppComponent]
})
export class DemoModule { }
