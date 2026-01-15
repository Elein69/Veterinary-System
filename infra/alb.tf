# alb.tf

# 1. El Balanceador de Carga (ALB)
resource "aws_lb" "app_lb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

# 2. Target Group para el API Gateway (Puerto 3000)
resource "aws_lb_target_group" "gateway_tg" {
  name        = "${var.project_name}-gw-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path    = "/"
    matcher = "200-404"
  }
}

# 3. Target Groups para los Microservicios
resource "aws_lb_target_group" "services" {
  for_each    = local.microservices_map
  # Usamos un nombre más corto para evitar que el substr termine en guion
  name        = "tg-${replace(each.key, "-service", "")}" 
  port        = each.value
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path    = "/"
    matcher = "200-404"
  }
}

# 4. Listener (Oído) del Balanceador en el puerto 80
resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_tg.arn
  }
}

# 5. REGLAS DE RUTEO (Esto es lo que pedía el ingeniero para no usar Cloudflare)
# Esta regla redirige el tráfico basado en la URL
resource "aws_lb_listener_rule" "service_routing" {
  for_each     = local.microservices_map
  listener_arn = aws_lb_listener.front_end.arn
  priority     = 10 + index(keys(local.microservices_map), each.key) # Genera prioridades 10, 11, 12...

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = ["/${replace(each.key, "-service", "")}*"] 
      # Esto hace que /iot-service o /iot funcionen
    }
  }
}