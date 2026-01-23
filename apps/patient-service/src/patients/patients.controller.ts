import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Patients')
@Controller()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar mascota' })
  @ApiResponse({ status: 201, description: 'Creado exitosamente.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las mascotas' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar por ID' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Listar mascotas de un dueño' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.patientsService.findByOwner(ownerId);
  }
}