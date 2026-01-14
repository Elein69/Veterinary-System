import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  private readonly logger = new Logger('NotificationService');

  // 1. De INVENTORY SERVICE
  @EventPattern('inventory_low_stock')
  handleLowStock(@Payload() data: any) {
    this.logger.warn('🚨 [ALERTA] Stock Crítico en Inventario');
    console.log(`📦 Producto: ${data.name} | Quedan: ${data.currentStock} unidades.`);
  }

  // 2. De STAFF SERVICE
  @EventPattern('staff_status_changed')
  handleStaffStatus(@Payload() data: any) {
    this.logger.log('👩‍⚕️ [STAFF] Cambio de disponibilidad');
    console.log(`👤 Veterinario: ${data.name} | Estado: ${data.newStatus ? 'Disponible' : 'Ocupado'}`);
  }

  // 3. De PATIENT SERVICE
  @EventPattern('patient_created')
  handlePatientCreated(@Payload() data: any) {
    this.logger.log('✨ [NUEVO PACIENTE] Registro exitoso');
    console.log(`🐾 Mascota: ${data.name} | Dueño: ${data.ownerName}`);
  }

  // 4. De BILLING SERVICE
  @EventPattern('crear_factura')
  handleInvoice(@Payload() data: any) {
    this.logger.log('💰 [FACTURACIÓN] Nueva factura generada');
    console.log(`📨 Enviando recibo al cliente por el paciente ID: ${data.patientId}`);
  }

  // 5. De IoT SERVICE (VITAL SIGNS)
  @EventPattern('vital_signs_alert')
  handleIotAlert(@Payload() data: any) {
    this.logger.error('⚠️ [URGENTE IoT] Signos Vitales Anormales');
    console.log(`🐾 Paciente ID: ${data.patientId} | Alerta: ${data.alertMessage}`);
  }

  // 6. De APPOINTMENT SERVICE
  @EventPattern('appointment_scheduled')
  handleAppointment(@Payload() data: any) {
    this.logger.log('📅 [CITAS] Cita programada correctamente');
    console.log(`🗓️ Fecha: ${data.date} | Veterinario: ${data.staffId}`);
  }
}