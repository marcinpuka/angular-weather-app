import { ICurrentWeather } from '../interfaces';
import { IWeatherService } from './weather.service';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

export const fakeWeather: ICurrentWeather = {
  city: 'Bethesda',
  country: 'US',
  date: 1485789600,
  image: '',
  temperature: 280.32,
  description: 'light indensity drizzle'
};

export class WeatherServiceFake implements IWeatherService {
  public getCurrentWeather(
    city: string,
    country: string): Observable<ICurrentWeather> {
    return of(fakeWeather);
  }
}
