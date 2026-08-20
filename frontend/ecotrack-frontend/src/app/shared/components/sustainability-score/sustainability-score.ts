import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  Subscription
} from 'rxjs';

import {
  ActivityService
} from '../../../core/services/activity.service';


@Component({
  selector: 'app-sustainability-score',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule
  ],

  templateUrl:
    './sustainability-score.html',

  styleUrl:
    './sustainability-score.css'
})
export class SustainabilityScore implements OnInit {
  score = 0; // Deprecated: Sustainability Score is currently unavailable as there is no backend definition.

  ngOnInit(): void {
    this.score = 0;
  }
}
