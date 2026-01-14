# Script para levantar todo el ecosistema veterinario
$services = @(
    "identity-service", "patient-service", "medical-service", 
    "iot-service", "appointment-service", "billing-service", 
    "inventory-service", "notification-service", "staff-service", 
    "audit-service"
)

foreach ($service in $services) {
    Write-Host "🚀 Iniciando $service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "npx nest start $service --watch"
}

Write-Host "✅ ¡Todos los microservicios están arrancando en ventanas independientes!" -ForegroundColor Green