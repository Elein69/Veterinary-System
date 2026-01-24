output "alb_dns_name" {
  description = "URL PRINCIPAL DE TU SISTEMA"
  value       = aws_lb.app_lb.dns_name
}

output "bastion_public_ip" {
  description = "IP ELASTICA DEL BASTION (ADMIN)"
  value       = aws_eip.bastion_eip.public_ip
}

# Output para la Base de Datos (PostgreSQL)
output "db_instance_endpoint" {
  description = "El host de la base de datos (sin el puerto)"
  value       = aws_db_instance.postgres_db.address
}

# Output para Redis
output "redis_endpoint" {
  description = "El endpoint de Redis para conectar Identity Service"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "BROKERS_INTERNAL_IP" {
  description = "IP Privada del Bastion. Usa esta IP para conectar: Kafka (9092), RabbitMQ (5672), MQTT (1883)"
  value       = aws_instance.jumpbox.private_ip
}