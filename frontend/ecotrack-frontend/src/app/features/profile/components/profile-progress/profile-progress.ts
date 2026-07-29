import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile-progress.html',
  styleUrl: './profile-progress.css'
})
export class ProfileProgress {

  progress = 86;

  nextLevel = 'Eco Master';

  remaining = 14;

}
