import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ICurrentWeather, IForcastData, IForcastUnit } from '../interfaces';
import { map, switchMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { PostalCodeService } from '../postal-code/postal-code.service';
import { environment } from 'src/environments/environment';
import { runInThisContext } from 'vm';

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

  readonly forecastWeather$ = new BehaviorSubject<IForcastData>({
    list: Array<IForcastUnit>()
  });

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
      temperature: this.convertKelvinToCelsius(data.main.temp),
      description: data.weather[0].description

    };
  }
  convertKelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
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
            // tslint:disable-next-line: prefer-const
            let a: number[];
            const lat = postalCode.lat;
            const lng = postalCode.lng;
            a.push(lat);
            a.push(lng);
            this.getForecast(a);
            return this.getCurrentWeatherByCoords({
              latitude: postalCode.lat,
              longitude: postalCode.lng,
            } as Coordinates);
          } else {
            const uriParams = new HttpParams().set(
              'q', country ? `${searchText},${country}` : searchText
            );
            const p = country ? `${searchText},${country}` : searchText;
            console.log(typeof p);
            this.getForecast(p);
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
    this.getForecast(coords);
    return this.getCurrentWeatherHelper(uriParams);
  }

  updateCurrentWeather(search: string, country?: string): void {
    this.getCurrentWeather(search, country)
      .subscribe(weather =>
        this.currentWeather$.next(weather));
  }

  getForecast(p: any) {
    let uriParams;

    console.log(p);

    if (typeof p === 'string') {
      uriParams = new HttpParams()
        .set('q', p)
        .set('units', 'metric')
        .set('appid', environment.appId);
    } else {
      uriParams = new HttpParams()
        .set('lat', p[0].toString())
        .set('lon', p[1].toString())
        .set('units', 'metric')
        .set('appid', environment.appId);
    }

    return this.httpClient.get<IForcastData>(
      `${environment.baseUrl}api.openweathermap.org/data/2.5/forecast?`, { params: uriParams }
    ).subscribe(forecast =>
      this.forecastWeather$.next(forecast));
  }
}
