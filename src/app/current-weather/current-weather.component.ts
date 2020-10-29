import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ICurrentWeather } from '../interfaces';
import { WeatherService } from '../weather/weather.service';

@Component({
  selector: 'app-current-weather',
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css']
})
export class CurrentWeatherComponent {

  current$: Observable<ICurrentWeather>;
  constructor(private weatherservice: WeatherService) {
    this.current$ = this.weatherservice.currentWeather$;
  }

  getOrdinal(date: number) {
    const n = new Date(date).getDate();
    return n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '';
  }

  getTomorrow(date: number) {
    const n = new Date(date).getDate();
    return n;
  }
}

