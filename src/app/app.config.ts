import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";
import { CalendarModule, CalendarA11y } from 'angular-calendar';
import { CommonModule } from '@angular/common';
import {routes} from "./app.routes";
import {environment} from "@ng-bootstrap/ng-bootstrap/environment"; // Import CommonModule

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

export const appConfig: ApplicationConfig = {
  providers: appProviders
};
