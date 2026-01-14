output "alb_dns_name" {
  description = "URL PRINCIPAL DE TU SISTEMA"
  value       = aws_lb.app_lb.dns_name
}

output "bastion_public_ip" {
  description = "IP ELASTICA DEL BASTION (ADMIN)"
  value       = aws_eip.bastion_eip.public_ip
}