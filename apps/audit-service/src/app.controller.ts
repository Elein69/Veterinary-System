import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger('SECURITY_AUDIT');

  constructor(private readonly auditService: AppService) {}

  @EventPattern('staff_status_changed')
  async auditStaff(@Payload() data: any) {
    await this.logAndSave('STAFF_MANAGEMENT', data);
  }

  // 2. AUDITORÍA DE INVENTARIO
  @EventPattern('inventory_low_stock')
  async auditInventory(@Payload() data: any) {
    await this.logAndSave('INVENTORY_WARNING', data);
  }

  // 3. AUDITORÍA DE FACTURACIÓN (Billing)
  @EventPattern('crear_factura')
  async auditBilling(@Payload() data: any) {
    await this.logAndSave('BILLING_TRANSACTION', data);
  }

  // 4. AUDITORÍA DE PACIENTES (Patient Service)
  @EventPattern('patient_created')
  async auditPatient(@Payload() data: any) {
    await this.logAndSave('PATIENT_RECORD_CREATED', data);
  }

  // 5. AUDITORÍA DE SIGNOS VITALES (IoT Service)
  @EventPattern('vital_signs_alert')
  async auditIot(@Payload() data: any) {
    await this.logAndSave('IOT_CRITICAL_ALERT', data);
  }

  // 6. AUDITORÍA DE CITAS (Appointment Service)
  @EventPattern('appointment_scheduled')
  async auditAppointment(@Payload() data: any) {
    await this.logAndSave('APPOINTMENT_EVENT', data);
  }

  // 7. AUDITORÍA DE SEGURIDAD (Identity Service)
  @EventPattern('user_login_attempt')
  async auditIdentity(@Payload() data: any) {
    await this.logAndSave('AUTH_SECURITY_EVENT', data);
  }

  private async logAndSave(action: string, payload: any) {
    const timestamp = new Date().toISOString();
    
    // 1. Guardar en Base de Datos
    await this.auditService.createLog(action, payload);

    // 2. Mostrar en Consola (como ya lo tenías)
    console.log(`\x1b[33m[🛡️ AUDIT][${timestamp}]\x1b[0m ACTION: \x1b[32m${action}\x1b[0m`);
    console.log(`🔍 DATA SAVED TO DB:`, JSON.stringify(payload, null, 2));
    console.log('----------------------------------------------------');
  }
}