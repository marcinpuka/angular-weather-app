export interface ICurrentWeather {
  city: string;
  country: string;
  date: number;
  image: string;
  temperature: number;
  description: string;
}

export interface IForcastUnit {
  dt: number;
  main: {
    temp: number
  };
}

export interface IForcastData {
  list: Array<IForcastUnit>;
}
