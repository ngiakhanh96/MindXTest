import { Country } from './../country.model';
import { CountryService } from './../country.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

export class DashboardDataSource implements DataSource<Country> {
  private countryListSubject = new BehaviorSubject<Country[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private countryService: CountryService) {}

  initialize(countries: Country[]) {
    this.countryListSubject.next(countries);
  }

  connect(collectionViewer: CollectionViewer): Observable<Country[]> {
    return this.countryListSubject
      .asObservable()
      .pipe(map((result) => result.slice(0, 10)));
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.countryListSubject.complete();
    this.loadingSubject.complete();
  }

  loadCountryList(countryNames: string[]) {
    this.loadingSubject.next(true);

    let currentCountryNames: string[] = [...countryNames];

    const countries$ = currentCountryNames.map((name) => {
      return this.countryService.getCountry(name);
    });

    forkJoin(countries$)
      .pipe(
        tap((result) => this.countryListSubject.next(result)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }
}
