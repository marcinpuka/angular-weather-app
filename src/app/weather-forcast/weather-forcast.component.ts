import { Component, OnInit } from '@angular/core';

import { IForcastData } from '../interfaces';
import { Observable } from 'rxjs';
import { WeatherService } from '../weather/weather.service';

@Component({
  selector: 'app-weather-forcast',
  templateUrl: './weather-forcast.component.html',
  styleUrls: ['./weather-forcast.component.css']
})
export class WeatherForcastComponent {

  forecast$: Observable<IForcastData>;

  constructor(private weatherService: WeatherService) {
    this.forecast$ = this.weatherService.forecastWeather$;
    console.log(this.forecast$);
  }
}

