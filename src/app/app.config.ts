import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // Import provideHttpClient

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import {FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig} from "@abacritt/angularx-social-login";
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(),    provideHttpClient(),MessageService,{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      lang: 'en',
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            "1086594586115-q75cm0sisdj4en60ebjbespk8ntafsg9.apps.googleusercontent.com"
          )
        }
      ],
      onError: (err) => {
        console.error(err);
      }
    } as SocialAuthServiceConfig,
  }] // Add provideHttpClient to providers]
};
