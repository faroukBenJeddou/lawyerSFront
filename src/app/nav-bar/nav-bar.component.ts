import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-nav-bar',
  standalone: true,
    imports: [
        MatIcon
    ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

}
