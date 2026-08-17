import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from '../../../core/services/profile';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.css'
})
export class WeatherCard implements OnInit {

  private profileService = inject(ProfileService);

  locationSet = true;
  weather: any = null;

  ngOnInit() {
    this.profileService.getProfile().subscribe(profile => {
      if (profile && profile.location && profile.location.trim().length > 0) {
        this.locationSet = true;
        this.weather = {
          city: profile.location,
          temperature: 24,
          condition: 'Clear',
          humidity: 50,
          wind: 10,
          icon: '☀️'
        };
      } else {
        this.locationSet = false;
        this.weather = null;
      }
    });
  }

  refresh() {
    if (this.locationSet) {
      alert('Weather API will be connected here.');
    }
  }

  get ecoSuggestion() {
    if (!this.weather) return '';
    switch(this.weather.condition) {
      case 'Sunny': return 'Perfect day for walking or cycling 🚶';
      case 'Rainy': return 'Use public transport today 🚌';
      case 'Cloudy': return 'Great weather for outdoor activities 🌳';
      default: return 'Have a sustainable day 🌱';
    }
  }
}
