# infra/alb.tf

# 1. BALANCEADOR DE CARGA (Renombrado a app_lb para coincidir con outputs.tf)
resource "aws_lb" "app_lb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# 2. TARGET GROUP PARA EL API GATEWAY (Puerto 3000)
resource "aws_lb_target_group" "gateway_tg" {
  name        = "api-gateway-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/api/health" 
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-499"
  }
}

# 3. TARGET GROUPS DINÁMICOS (Para Staff, Patient, IoT, etc.)
resource "aws_lb_target_group" "microservices" {
  for_each    = local.microservices_map 
  name        = "${each.key}-tg"        
  port        = each.value              
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/${replace(each.key, "-service", "")}/health"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 5
    matcher             = "200-399" 
  }
}

# 4. LISTENER (El Oído del Balanceador)
resource "aws_lb_listener" "front_end" {
  # CORRECCIÓN: Apuntamos al recurso "app_lb"
  load_balancer_arn = aws_lb.app_lb.arn 
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404: No encontrado en Veterinary System"
      status_code  = "404"
    }
  }
}

# 5. REGLAS DE ENRUTAMIENTO DINÁMICAS
resource "aws_lb_listener_rule" "microservices_rules" {
  for_each     = local.microservices_map
  listener_arn = aws_lb_listener.front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.microservices[each.key].arn
  }

  condition {
    path_pattern {
      values = [
        "/${each.key}/*", 
        "/${replace(each.key, "-service", "")}/*"
      ]
    }
  }
}

# 6. REGLA PARA EL API GATEWAY
resource "aws_lb_listener_rule" "gateway_rule" {
  listener_arn = aws_lb_listener.front_end.arn
  priority     = 100 

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}