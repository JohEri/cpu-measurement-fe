import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  cpuDocument,
  cpuMeasurement,
  cpuMeasurementRequestBody,
} from './types/cpu.types';

@Injectable({
  providedIn: 'root',
})
export class CpuService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createCpuMeasurement(data: cpuMeasurementRequestBody): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/cpu-usage`, data);
  }

  getCpuMeasurement(id: string): Observable<cpuMeasurement> {
    return this.http.get<cpuMeasurement>(`${this.apiUrl}/cpu-usage/${id}`);
  }

  getCpuMeasurements(): Observable<cpuMeasurement[]> {
    return this.http.get<cpuMeasurement[]>(`${this.apiUrl}/cpu-usage`);
  }

  measureCpuUsage(): Observable<{ cpuLoad: number }> {
    return this.http.get<{ cpuLoad: number }>(`${this.apiUrl}/measure`);
  }

  updateCpuMeasurement(
    id: string,
    data: cpuMeasurementRequestBody
  ): Observable<any> {
    console.log('Parameter:', id, 'Body:', data);
    return this.http.put<any>(`${this.apiUrl}/cpu-usage/${id}`, data);
  }
}
