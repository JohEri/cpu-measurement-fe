import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CpuService } from './cpu.service';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { cpuDocument, cpuMeasurement } from './types/cpu.types';
import { sortOrder } from './enums/sortOrder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'CPU Monitoring Tool';
  latestMeasurement: number = 0;
  avgCpuLoad: number = 0;
  cpuMeasurement: number[] = [];
  globalCpuMeasurements: cpuMeasurement[] = [];
  currentSortOrder: { column: string; order: sortOrder } | null = null;
  loading: boolean = false;
  id = localStorage.getItem('existing_measurement_id');

  constructor(private cpuService: CpuService) {}

  ngOnInit() {
    this.fetchCpuUsage();
    this.fetchGlobalCpuUsage();
  }

  getSortOrder(column: string): sortOrder {
    if (!this.currentSortOrder) return sortOrder.desc;
    if (this.currentSortOrder.column === column) {
      return this.currentSortOrder.order === sortOrder.desc
        ? sortOrder.asc
        : sortOrder.desc;
    } else {
      return sortOrder.desc;
    }
  }

  sortTable(column: string, order: sortOrder) {
    this.globalCpuMeasurements.sort((a: any, b: any) => {
      if (a[column] < b[column]) {
        return order === sortOrder.desc ? 1 : -1;
      } else if (a[column] > b[column]) {
        return order === sortOrder.desc ? -1 : 1;
      }
      return 0;
    });
    this.currentSortOrder = { column, order };
  }

  cpuLoadAverage() {
    if (this.cpuMeasurement.length === 0) return;
    var avgCpuLoad: number = 0;

    this.cpuMeasurement.forEach((measurement: number) => {
      avgCpuLoad = avgCpuLoad + measurement;
    });
    avgCpuLoad = avgCpuLoad / this.cpuMeasurement.length;
    this.avgCpuLoad = avgCpuLoad;
  }

  fetchCpuUsage() {
    if (this.id) {
      this.cpuService
        .getCpuMeasurement(this.id)
        .subscribe((data: cpuMeasurement) => {
          this.latestMeasurement = data.latestMeasurement;
          this.avgCpuLoad = data.avgCpuLoad;
        });
    }
  }

  fetchGlobalCpuUsage() {
    this.cpuService.getCpuMeasurements().subscribe((data: cpuMeasurement[]) => {
      this.globalCpuMeasurements = data;
    });
  }

  startMeasurement() {
    this.loading = true;
    this.cpuMeasurement.length = 0;

    this.measureCpuUsage();
    const interval = setInterval(() => {
      if (this.cpuMeasurement.length === 4) {
        window.clearInterval(interval);
        this.cpuLoadAverage();
        this.saveCpuMeasurements();
        this.loading = false;
      } else {
        this.measureCpuUsage();
      }
    }, 2500);
  }

  measureCpuUsage() {
    this.cpuService.measureCpuUsage().subscribe(data => {
      const cpuLoad = data.cpuLoad;
      this.latestMeasurement = cpuLoad;
      this.cpuMeasurement.push(cpuLoad);
    });
  }

  saveCpuMeasurements() {
    if (this.id) {
      console.log('Attempting to save...');
      this.cpuService
        .updateCpuMeasurement(this.id, {
          avgCpuLoad: this.avgCpuLoad,
          latestMeasurement: this.latestMeasurement,
          date: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
        })
        .subscribe(data => {});
    } else {
      this.cpuService
        .createCpuMeasurement({
          avgCpuLoad: this.avgCpuLoad,
          latestMeasurement: this.latestMeasurement,
          date: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
        })
        .subscribe((id: string) => {
          localStorage.setItem('existing_measurement_id', id);
          console.log('ID set to local storage!', id);
        });
    }
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
});
