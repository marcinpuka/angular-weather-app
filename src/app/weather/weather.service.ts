import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

import { ICurrentWeather } from '../interfaces';
import { Injectable } from '@angular/core';
import { PostalCodeService } from '../postal-code/postal-code.service';
import { environment } from 'src/environments/environment';

interface ICurrentWeatherData {
  weather: [{
    description: string,
    icon: string
  }];
  main: {
    temp: number
  };
  sys: {
    country: string
  };
  dt: number;
  name: string;
}

export interface IWeatherService {
  readonly currentWeather$: BehaviorSubject<ICurrentWeather>;
  getCurrentWeather(
    search: string,
    country?: string
  ): Observable<ICurrentWeather>;
  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather>;
  updateCurrentWeather(
    search: string,
    country?: string
  ): void;
}


@Injectable({
  providedIn: 'root'
})
export class WeatherService implements IWeatherService {

  constructor(private httpClient: HttpClient, private postalCodeService: PostalCodeService) { }

  readonly currentWeather$ = new BehaviorSubject<ICurrentWeather>({
    city: '--',
    country: '--',
    date: Date.now(),
    image: '',
    temperature: 0,
    description: ''
  });

  private transformToICurrentWeahter(data: ICurrentWeatherData): ICurrentWeather {
    return {
      city: data.name,
      country: data.sys.country,
      date: data.dt * 1000,
      image:
        `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
      temperature: this.convertKelvinToFahrenheit(data.main.temp),
      description: data.weather[0].description

    };
  }
  convertKelvinToFahrenheit(kelvin: number): number {
    return kelvin * 9 / 5 - 459.67;
  }

  getCurrentWeather(searchText: string, country?: string): Observable<ICurrentWeather> {
    /*     let uriParams = new HttpParams();
        if (typeof search === 'string') {
          uriParams = uriParams.set('q', country ? `${search},${country}` : search);
        } else {
          uriParams = uriParams.set('zip', 'search');
        }
        return this.getCurrentWeatherHelper(uriParams); */
    return this.postalCodeService.resolvePostalCode(searchText)
      .pipe(
        switchMap((postalCode) => {
          if (postalCode) {
            console.log('coordinates: ' + postalCode.lat);
            console.log('coordinates lng: ' + postalCode.lng);
            return this.getCurrentWeatherByCoords({
              latitude: postalCode.lat,
              longitude: postalCode.lng,
            } as Coordinates);
          } else {
            const uriParams = new HttpParams().set(
              'q', country ? `${searchText},${country}` : searchText
            );
            return this.getCurrentWeatherHelper(uriParams);
          }
        })
      );


  }

  getCurrentWeatherHelper(uriParams: HttpParams): Observable<ICurrentWeather> {
    uriParams = uriParams
      .set('appid', environment.appId);
    return this.httpClient
      .get<ICurrentWeatherData>(
        `${environment.baseUrl}api.openweathermap.org/data/2.5/weather?`,
        { params: uriParams }
      ).pipe(map(data => this.transformToICurrentWeahter(data)));
  }

  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather> {
    const uriParams = new HttpParams()
      .set('lat', coords.latitude.toString())
      .set('lon', coords.longitude.toString());
    return this.getCurrentWeatherHelper(uriParams);
  }

  updateCurrentWeather(search: string, country?: string): void {
    this.getCurrentWeather(search, country)
      .subscribe(weather =>
        this.currentWeather$.next(weather));
  }
}
