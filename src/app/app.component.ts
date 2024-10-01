import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ProgressBarModule } from 'primeng/progressbar';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {CalendarA11y, DateAdapter} from 'angular-calendar';
import {CalendarModule} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DemoModule } from './calendar.module';
import { ConsultationsComponent } from "./Components/Lawyer/consultations/consultations.component";  // Import the shared module here
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarNativeDateFormatter, CalendarDateFormatter, CalendarUtils } from 'angular-calendar';
import {A11yModule} from "@angular/cdk/a11y";
import {BrowserModule} from "@angular/platform-browser";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [

    { provide: DateAdapter, useFactory: adapterFactory },
    {
      provide: CalendarDateFormatter,
      useClass: CalendarDateFormatter,
      // Use default formatter
    },

  ]
})
export class AppComponent {
  title = 'LawyerSoft';
}
