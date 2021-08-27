import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CountryService } from '../country.service';
import { DashboardDataSource } from './dashboard-datasource.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  myControl = new FormControl();

  worldPopulation: number = 0;
  totalCountriesCount: number = 0;
  allCountryNames: string[] = [];
  currentCountryNames: string[] = [];
  largestCountryNames: string[] = [];
  filterText: string = '';
  suggestedCountryNames: string[] = [];

  displayedColumns: string[] = ['ranking', 'countryName', 'population'];
  dataSource: DashboardDataSource;
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(private countryService: CountryService) {
    this.dataSource = new DashboardDataSource(countryService);
  }

  ngOnInit(): void {
    this.countryService.getWorldPopulation().subscribe((result) => {
      this.worldPopulation = result.world_population;
    });

    this.countryService.getAllCountryNames().subscribe((result) => {
      this.totalCountriesCount = result.length;
      this.allCountryNames = result;
      this.suggestedCountryNames = [...this.allCountryNames];
      this.currentCountryNames = this.allCountryNames.slice(
        this.pageSize * this.currentPage,
        this.pageSize * this.currentPage + this.pageSize
      );
      this.loadData();
    });

    this.myControl.valueChanges
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((result) => {
        this.filterText = result;
        this.suggestedCountryNames = this.allCountryNames.filter((name) => {
          if (this.filterText.trim().length > 0) {
            return name.toLowerCase().startsWith(this.filterText.toLowerCase());
          }
          return true;
        });
        this.currentPage = 0;
        if (this.filterText.trim().length > 0) {
          this.currentCountryNames = this.suggestedCountryNames.slice(
            this.pageSize * this.currentPage,
            this.pageSize * this.currentPage + this.pageSize
          );
          this.totalCountriesCount = this.suggestedCountryNames.length;
        } else {
          this.currentCountryNames = this.allCountryNames.slice(
            this.pageSize * this.currentPage,
            this.pageSize * this.currentPage + this.pageSize
          );
          this.totalCountriesCount = this.allCountryNames.length;
        }

        this.loadData();
      });
  }

  displayFn(countryName: string): string {
    return countryName;
  }

  onPageChanged(page: PageEvent) {
    this.currentPage = page.pageIndex;
    if (this.filterText.trim().length > 0) {
      this.currentCountryNames = this.suggestedCountryNames.slice(
        this.pageSize * this.currentPage,
        this.pageSize * this.currentPage + this.pageSize
      );
      this.totalCountriesCount = this.suggestedCountryNames.length;
    } else {
      this.currentCountryNames = this.allCountryNames.slice(
        this.pageSize * this.currentPage,
        this.pageSize * this.currentPage + this.pageSize
      );
      this.totalCountriesCount = this.allCountryNames.length;
    }
    this.loadData();
  }

  loadData() {
    if (this.largestCountryNames.length == 0) {
      const countries$ = this.allCountryNames.slice(0, 20).map((name) => {
        return this.countryService.getCountry(name);
      });

      forkJoin(countries$).subscribe((result) => {
        this.largestCountryNames = result.map((country) => country.countryName);
        this.dataSource.initialize(result);
      });
    } else {
      this.dataSource.loadCountryList(this.currentCountryNames);
    }
  }
}
