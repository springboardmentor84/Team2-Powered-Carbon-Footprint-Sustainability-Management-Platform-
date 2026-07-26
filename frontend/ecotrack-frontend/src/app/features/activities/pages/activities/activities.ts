import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivitySummary } from '../../components/activity-summary/activity-summary';
import { ActivityFilter } from '../../components/activity-filter/activity-filter';
import { ActivityTable } from '../../components/activity-table/activity-table';

@Component({
  selector:'app-activities',
  standalone:true,
  imports:[
    CommonModule,
    ActivitySummary,
    ActivityFilter,
    ActivityTable
  ],
  templateUrl:'./activities.html',
  styleUrl:'./activities.css'
})
export class Activities{}
