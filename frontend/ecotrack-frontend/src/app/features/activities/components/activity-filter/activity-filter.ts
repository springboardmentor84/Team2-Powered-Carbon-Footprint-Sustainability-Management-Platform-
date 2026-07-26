import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector:'app-activity-filter',
  standalone:true,
  imports:[
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl:'./activity-filter.html',
  styleUrl:'./activity-filter.css'
})
export class ActivityFilter{

  search='';

  categories=[
    'All',
    'Walking',
    'Cycling',
    'Transport',
    'Recycling',
    'Electricity'
  ];

}
