import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { CurrentWeatherComponent } from './current-weather.component';
import { MaterialModule } from '../material.module';
import { WeatherService } from '../weather/weather.service';
import { WeatherServiceFake } from '../weather/weather.service.fake';
import { injectSpy } from 'angular-unit-test-helper';

describe('CurrentWeatherComponent', () => {
  let component: CurrentWeatherComponent;
  let fixture: ComponentFixture<CurrentWeatherComponent>;
  let weatherServiceMock: jasmine.SpyObj<WeatherService>;

  beforeEach(async(() => {

    const weatherServiceSpy = jasmine.createSpyObj('WeatherService', ['getCurrentWeather']);

    TestBed.configureTestingModule({
      declarations: [CurrentWeatherComponent],
      imports: [MaterialModule],
      providers: [
        { provide: WeatherService, useValue: weatherServiceSpy }
      ]
    })
      .compileComponents();
    weatherServiceMock = injectSpy(WeatherService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentWeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
