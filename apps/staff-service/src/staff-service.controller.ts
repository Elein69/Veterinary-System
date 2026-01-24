import { Controller, Get, Post, Patch, Param, Body, ParseUUIDPipe, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StaffService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateStaffDto } from './dto/create-staff.dto';

@ApiTags('Medical Staff Management')
@Controller()
export class StaffServiceController {
  private readonly logger = new Logger(StaffServiceController.name);

  constructor(private readonly staffService: StaffService) {}

  // --- ENDPOINTS HTTP (API REST) ---

  @Get()
  @ApiOperation({ summary: 'List all staff members from PostgreSQL' })
  getAll() { 
    return this.staffService.findAll(); 
  }

  @Post()
  @ApiOperation({ summary: 'Register a new staff member' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Change availability status (Emits Kafka Event)' })
  toggle(@Param('id', ParseUUIDPipe) id: string) { // 👈 Cambiado a string y UUID
    return this.staffService.toggleAvailability(id);
  }

  // --- RABBITMQ/KAFKA PATTERN (RPC o Eventos de validación) ---
  @MessagePattern('validate_staff_availability')
  handleValidation(@Payload() data: any) {
    this.logger.log(`🔍 Checking availability for Vet ID: ${data.staffId}`);
    // Nota: Si usas UUID en la base de datos, el staffId recibido debe ser string
    const available = this.staffService.checkAvailability(data.staffId);
    return { staffId: data.staffId, available };
  }
}