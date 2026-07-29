import { Component, EventEmitter, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-activity-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './activity-filter.html',
  styleUrl: './activity-filter.css'
})
export class ActivityFilter {

  @Output() filterChanged = new EventEmitter<any>();

  search = '';

  category = '';

  sort = 'latest';

  categories = [
    'Walking',
    'Cycling',
    'Recycling',
    'Transport',
    'Food',
    'Electricity',
    'Water',
    'Waste'
  ];

  applyFilters() {

    this.filterChanged.emit({
      search: this.search,
      category: this.category,
      sort: this.sort
    });

  }

  reset() {

    this.search = '';
    this.category = '';
    this.sort = 'latest';

    this.applyFilters();

  }

}
