import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import {
  CalendarCommonModule, CalendarDayModule,
  CalendarModule,
  CalendarMonthModule,
  CalendarWeekModule,
  DateAdapter
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import {
  CommonModule,
  JsonPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgOptimizedImage,
  NgStyle,
  NgSwitch,
  NgSwitchCase
} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {provideRouter, RouterLink, RouterOutlet} from "@angular/router";
import {CardModule} from "primeng/card";
import {InputTextModule} from "primeng/inputtext";
import {Button, ButtonModule} from "primeng/button";
import {MatSelectModule} from "@angular/material/select";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {ProgressBarModule} from "primeng/progressbar";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {HttpClientModule, provideHttpClient} from "@angular/common/http";
import {DemoModule} from "./calendar.module";
import {
  GoogleLoginProvider,
  GoogleSigninButtonModule,
  SocialAuthService,
  SocialAuthServiceConfig
} from "@abacritt/angularx-social-login";
import {MessageService} from "primeng/api";
import {LoginComponent} from "./Components/login/login.component";
import {routes} from "./app.routes";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {ConsultationsComponent} from "./Components/Lawyer/consultations/consultations.component";
import {MatIcon} from "@angular/material/icon";
import {DayPilotModule} from "@daypilot/daypilot-lite-angular";
import {CaseDetailsComponent} from "./Components/case/case-details/case-details.component";
import {ClientViewComponent} from "./Components/Client/client-view/client-view.component";
import {ClientLawyerComponent} from "./Components/Client/client-lawyer/client-lawyer.component";
import {ClientConsultationComponent} from "./Components/Client/client-consultation/client-consultation.component";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatCheckbox} from "@angular/material/checkbox";
import {ToastrModule} from "ngx-toastr";
import {LawyerViewComponent} from "./Components/Lawyer/lawyer-view/lawyer-view.component";
import {AllprofilesComponent} from "./Components/allprofiles/allprofiles.component";
import {NavBarComponent} from "./nav-bar/nav-bar.component";
import {LawyersProfilesComponent} from "./Components/lawyers-profiles/lawyers-profiles.component";
import {RatingComponent} from "./Components/rating/rating.component";
import {ChartModule} from "primeng/chart";
import {AssistantViewComponent} from "./Components/Assistant/assistant-view/assistant-view.component";
import {
  AssistantConsultationsComponent
} from "./Components/Assistant/assistant-consultations/assistant-consultations.component";
import {AssistantLawyerComponent} from "./Components/Assistant/assistant-lawyer/assistant-lawyer.component";
const appProviders = [
  provideRouter(routes),
  provideAnimationsAsync(),
  provideHttpClient(),
  { provide: MessageService, useClass: MessageService },
  // {
  //   provide: 'SocialAuthServiceConfig',
  //   useValue: {
  //     autoLogin: false,
  //     lang: 'en',
  //     providers: [
  //       {
  //         id: GoogleLoginProvider.PROVIDER_ID,
  //         provider: new GoogleLoginProvider(
  //           '1086594586115-q75cm0sisdj4en60ebjbespk8ntafsg9.apps.googleusercontent.com'
  //         )
  //       }
  //     ],
  //     onError: (err) => {
  //       console.error(err);
  //     }
  //   } as SocialAuthServiceConfig,
  {
    provide: "SocialAuthServiceConfig",
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider("1086594586115-q75cm0sisdj4en60ebjbespk8ntafsg9.apps.googleusercontent.com", {
            oneTapEnabled: false,
          }),
        },
      ],
      onError: (err) => {
        console.error(err);
      },
    } as SocialAuthServiceConfig,
  },
];
@NgModule({
    declarations: [AppComponent, CalendarComponent,LoginComponent,ConsultationsComponent,ClientViewComponent,ClientLawyerComponent,
      ClientConsultationComponent,LawyerViewComponent,AllprofilesComponent,LawyersProfilesComponent,RatingComponent,AssistantViewComponent,AssistantConsultationsComponent,AssistantLawyerComponent],
    imports: [
        FormsModule,
        MatIcon,
        NgForOf,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        NgClass,
        NgStyle,
        CommonModule,
        CalendarModule,
      ChartModule,
        FlatpickrModule,
        MatIcon,
        NgForOf,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        NgStyle,
        NgIf,
        DayPilotModule,
        JsonPipe,
        CalendarCommonModule,
        NgSwitch,
        CalendarMonthModule,
        CalendarWeekModule,
        CalendarDayModule,
        NgSwitchCase,
        FlatpickrModule,
        CaseDetailsComponent,
        CardModule,
        Button,
        ReactiveFormsModule,
        MatLabel,
        MatFormField,
        MatInput,
        NgOptimizedImage,
        RouterLink,
        NgIf,
        RouterLink,
        NgForOf,
        ReactiveFormsModule,
        NgClass,
        NgStyle,
        ToastrModule.forRoot({
            timeOut: 3000, // 3 seconds timeout
            positionClass: 'toast-top-right',
            preventDuplicates: true,
        }),
        GoogleSigninButtonModule,
        BrowserModule,
        FlatpickrModule,
        CommonModule,
        CalendarModule,
        RouterOutlet,
        CardModule,
        InputTextModule,
        ReactiveFormsModule,
        ButtonModule,
        FormsModule,
        MatSelectModule,
        MatFormFieldModule,
        ProgressBarModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        NgbModalModule,
        MatDatepickerModule,
        MatNativeDateModule,
        HttpClientModule,
        DemoModule,
        BrowserModule,
        AppRoutingModule,
        CommonModule,
        FormsModule,
        NgbModalModule,
        CardModule,
        Button,
        ReactiveFormsModule,
        MatLabel,
        MatFormField,
        MatInput,
        NgOptimizedImage,
        RouterLink,
        NgIf,
        GoogleSigninButtonModule,
        FlatpickrModule.forRoot(),
        BrowserAnimationsModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        }),
        MatCard,
        MatCardContent,
        MatCheckbox,
        NavBarComponent,
    ],
    providers: appProviders,
    bootstrap: [AppComponent],
    exports: [
        CalendarComponent,LoginComponent,ClientViewComponent,ClientLawyerComponent,ClientConsultationComponent,LawyerViewComponent,AllprofilesComponent,LawyersProfilesComponent,
      RatingComponent,AssistantViewComponent,AssistantConsultationsComponent,AssistantLawyerComponent
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line
})
export class AppModule {}
