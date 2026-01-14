import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';

@Injectable()
export class TelemetryService implements OnModuleInit {
  private influxDB: InfluxDB;
  private writeApi: WriteApi;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // 1. Leemos las variables
    const url = this.configService.get<string>('INFLUXDB_URL');
    const token = this.configService.get<string>('INFLUXDB_TOKEN');
    const org = this.configService.get<string>('INFLUXDB_ORG');
    const bucket = this.configService.get<string>('INFLUXDB_BUCKET');

    // 2. Imprimimos en consola para depurar (DEBUG)
    console.log('--- IOT SERVICE CONFIG ---');
    console.log('URL:', url);
    console.log('ORG:', org);
    console.log('BUCKET:', bucket);
    console.log('TOKEN Length:', token ? token.length : 'MISSING');
    console.log('--------------------------');

    // 3. Validamos ANTES de conectar
    if (!url || !token || !org || !bucket) {
      throw new Error('❌ CRITICAL ERROR: Missing environment variables in .env file. Please check logs above.');
    }

    // 4. Conectamos
    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(org, bucket);
  }

  create(createTelemetryDto: CreateTelemetryDto) {
    const point = new Point('vital_signs')
      .tag('patientId', createTelemetryDto.patientId)
      .floatField('temperature', createTelemetryDto.temperature)
      .intField('heartRate', createTelemetryDto.heartRate);

    this.writeApi.writePoint(point);
    this.writeApi.flush(); 
    return { status: 'Data written to InfluxDB', timestamp: new Date() };
  }

  async getLatest(patientId: string) {
    const org = this.configService.get<string>('INFLUXDB_ORG');
    const bucket = this.configService.get<string>('INFLUXDB_BUCKET');
    
    if (!org || !bucket) throw new Error('Missing Config for Query');

    const queryApi = this.influxDB.getQueryApi(org);
    const fluxQuery = `
      from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "vital_signs")
      |> filter(fn: (r) => r.patientId == "${patientId}")
      |> last()
    `;
    return queryApi.collectRows(fluxQuery);
  }
}