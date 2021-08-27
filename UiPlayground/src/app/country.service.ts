import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Country } from './country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  apiUrl = 'https://world-population.p.rapidapi.com/';
  constructor(private http: HttpClient) {}

  getWorldPopulation() {
    return this.http
      .get<any>(this.apiUrl + 'worldpopulation', {
        headers: {
          ['x-rapidapi-host']: 'world-population.p.rapidapi.com',
          ['x-rapidapi-key']:
            'ed74e2be46msha0be35e5f345febp17ac10jsn4262a33cbe07',
        },
      })
      .pipe(map((result) => result.body));
  }

  getCountry(countryName: string) {
    return this.http
      .get<any>(this.apiUrl + 'population', {
        params: { ['country_name']: countryName },
        headers: {
          ['x-rapidapi-host']: 'world-population.p.rapidapi.com',
          ['x-rapidapi-key']:
            'ed74e2be46msha0be35e5f345febp17ac10jsn4262a33cbe07',
        },
      })
      .pipe(
        map(
          (result) =>
            <Country>{
              countryName: result.body.country_name,
              population: result.body.population,
              ranking: result.body.ranking,
              worldShare: result.body.world_share,
            }
        )
      );
  }

  getAllCountryNames() {
    return this.http
      .get<any>(this.apiUrl + 'allcountriesname', {
        headers: {
          ['x-rapidapi-host']: 'world-population.p.rapidapi.com',
          ['x-rapidapi-key']:
            'ed74e2be46msha0be35e5f345febp17ac10jsn4262a33cbe07',
        },
      })
      .pipe(map((result) => result.body.countries as string[]));
  }
}
