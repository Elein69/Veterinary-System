import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateAppointmentDto } from './dto/create-appointment.dto'; 

@ApiTags('Appointments')
@Controller()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cita (Trigger Kafka & RabbitMQ)' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  // 👇 GET MEJORADO: Recibe filtros desde la URL
  @Get()
  @ApiOperation({ summary: 'Listar citas con filtros opcionales' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filtrar por Paciente' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filtrar por Doctor' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por Estado (CONFIRMED, PENDING)' })
  findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
  ) {
    // Pasamos los parámetros al servicio como un objeto
    return this.appointmentService.findAll({ patientId, doctorId, status });
  }
}