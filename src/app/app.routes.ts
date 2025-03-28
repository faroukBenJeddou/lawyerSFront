import { Routes } from '@angular/router';
import {LoginComponent} from "./Components/login/login.component";
import {CreateAccountComponent} from "./Components/create-account/create-account.component";
import {HomeComponent} from "./Components/home/home.component";
import {ClientViewComponent} from "./Components/Client/client-view/client-view.component";
import {LawyerViewComponent} from "./Components/Lawyer/lawyer-view/lawyer-view.component";
import {authGuard} from "./guards/auth.guard";
import {LawyerClientsComponent} from "./Components/Lawyer/lawyer-clients/lawyer-clients.component";
import {NotFoundComponent} from "./Components/not-found/not-found.component";
import {Case} from "./Models/Case";
import {CasesComponent} from "./Components/Lawyer/cases/cases.component";
import {ConsultationsComponent} from "./Components/Lawyer/consultations/consultations.component";
import {AssistantComponent} from "./Components/Lawyer/assistant/assistant.component";
import {CaseDetailsComponent} from "./Components/case/case-details/case-details.component";
import {ClientCaseComponent} from "./Components/Client/client-case/client-case.component";
import {ClientConsultationComponent} from "./Components/Client/client-consultation/client-consultation.component";
import {ClientLawyerComponent} from "./Components/Client/client-lawyer/client-lawyer.component";
import {CalendarComponent} from "./calendar/calendar.component";
import {CaseDetailsClientComponent} from "./Components/Client/case-details-client/case-details-client.component";
import {ForgotPasswordComponent} from "./Components/forgot-password/forgot-password.component";
import {ResetPasswordComponent} from "./Components/reset-password/reset-password.component";
import {EditProfileLawyerComponent} from "./Components/Lawyer/edit-profile-lawyer/edit-profile-lawyer.component";
import {EditClientProfileComponent} from "./Components/Client/edit-client-profile/edit-client-profile.component";
import {AllprofilesComponent} from "./Components/allprofiles/allprofiles.component";
import {InvoiceComponent} from "./Components/Lawyer/invoice/invoice.component";
import {AssistantViewComponent} from "./Components/Assistant/assistant-view/assistant-view.component";
import {AssistantClientsComponent} from "./Components/Assistant/assistant-clients/assistant-clients.component";
import {AssistantCasesComponent} from "./Components/Assistant/assistant-cases/assistant-cases.component";
import {
  AssistantCaseDetailsComponent
} from "./Components/Assistant/assistant-case-details/assistant-case-details.component";
import {
  AssistantConsultationsComponent
} from "./Components/Assistant/assistant-consultations/assistant-consultations.component";
import {AssistantLawyerComponent} from "./Components/Assistant/assistant-lawyer/assistant-lawyer.component";

export const routes: Routes = [
  {path:'login', component: LoginComponent},
  {path:'register',component:CreateAccountComponent},
  {path:'client/:id',component:ClientViewComponent, canActivate: [authGuard], data: { role: 'Client' }},
  { path: 'assistant/:id', component: AssistantViewComponent, canActivate: [authGuard], data: { role: 'Assistant' } },
  {path:'lawyer/:id',component:LawyerViewComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'edit/lawyer/:id',component:EditProfileLawyerComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'client/edit/:id',component:EditClientProfileComponent,canActivate: [authGuard], data: { expectedRole: 'Client' }},
  {path:'lawyer/:id/calendar',component:CalendarComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'lawyer/:id/clients',component:LawyerClientsComponent,canActivate: [authGuard],   data: { expectedRole: ['Lawyer', 'Assistant'] }},
  {path:'assistant/:id/clients',component:AssistantClientsComponent,canActivate: [authGuard],   data: { expectedRole: ['Lawyer', 'Assistant'] }},
  {path:'lawyer/:id/cases',component:CasesComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'assistant/:id/cases',component:AssistantCasesComponent,canActivate: [authGuard], data: { expectedRole: 'Assistant' }},
  {path:'lawyer/:id/consultations',component:ConsultationsComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'assistant/:id/consultations',component:AssistantConsultationsComponent,canActivate: [authGuard], data: { expectedRole: 'Assistant' }},
  {path:'lawyer/:id/cases/:caseId',component:CaseDetailsComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'assistant/:id/cases/:caseId',component:AssistantCaseDetailsComponent,canActivate: [authGuard], data: { expectedRole: 'Assistant' }},
  {path:'lawyer/:id/assistant',component:AssistantComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  {path:'assistant/:id/lawyer',component:AssistantLawyerComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},

  {path:'client/:id/case',component:ClientCaseComponent,canActivate: [authGuard], data: { expectedRole: 'Client' }},
  {path:'client/:id/consultations',component:ClientConsultationComponent,canActivate: [authGuard], data: { expectedRole: 'Client' }},
  {path:'client/:clientId/lawyer',component:ClientLawyerComponent,canActivate: [authGuard], data: { expectedRole: 'Client' }},
  {path:'client/:id/case/:caseId',component:CaseDetailsClientComponent,canActivate: [authGuard], data: { expectedRole: 'Client' }},
  {path:'client/:id/case/:caseId',component:CaseDetailsClientComponent,canActivate: [authGuard], data: { expectedRole: 'Client' }},
  {path:'forgotPassword',component:ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile/:id/:lawyerId', component: AllprofilesComponent },
  {path: 'lawyer/:id/invoice',component: InvoiceComponent,canActivate: [authGuard], data: { expectedRole: 'Lawyer' }},
  { path: 'home', component: HomeComponent },
  { path: 'notFound', component: NotFoundComponent }, // Ensure this component exists
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/notFound' }
];
