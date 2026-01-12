import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Telemetry (IoT)')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  @ApiOperation({ summary: 'Receive sensor data from IoT device' })
  create(@Body() createTelemetryDto: CreateTelemetryDto) {
    return this.telemetryService.create(createTelemetryDto);
  }

  @Get(':patientId')
  @ApiOperation({ summary: 'Get latest vitals for a patient' })
  getLatest(@Param('patientId') patientId: string) {
    return this.telemetryService.getLatest(patientId);
  }
}