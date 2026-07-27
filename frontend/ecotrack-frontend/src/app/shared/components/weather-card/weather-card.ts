import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.css'
})
export class WeatherCard {

  weather={

    city:'Sambalpur',

    temperature:29,

    condition:'Sunny',

    humidity:58,

    wind:11,

    icon:'☀️'

  };

  refresh(){

    // Backend API
    // weatherService.getWeather().subscribe(...)

    alert('Weather API will be connected here.');

  }

  get ecoSuggestion(){

    switch(this.weather.condition){

      case 'Sunny':

        return 'Perfect day for walking or cycling 🚶';

      case 'Rainy':

        return 'Use public transport today 🚌';

      case 'Cloudy':

        return 'Great weather for outdoor activities 🌳';

      default:

        return 'Have a sustainable day 🌱';

    }

  }

}
