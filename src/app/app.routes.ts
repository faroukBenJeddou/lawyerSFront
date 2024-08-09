import { Routes } from '@angular/router';
import {LoginComponent} from "./Components/login/login.component";
import {CreateAccountComponent} from "./Components/create-account/create-account.component";
import {HomeComponent} from "./Components/home/home.component";

export const routes: Routes = [
  {path:'login', component: LoginComponent},
  {path:'register',component:CreateAccountComponent},
  {path:'home',component:HomeComponent},
  {path:'',redirectTo:'home',pathMatch:'full'}
];
