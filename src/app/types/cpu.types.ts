export type cpuDocument = {
  id: string;
  data: cpuMeasurement;
};

export type cpuMeasurement = {
  avgCpuLoad: number;
  latestMeasurement: number;
  date: string;
  ip: string;
};

export type cpuMeasurementRequestBody = {
  avgCpuLoad: number;
  latestMeasurement: number;
  date: string;
};
