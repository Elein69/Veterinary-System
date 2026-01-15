# asg.tf

data "aws_ami" "ecs_optimized" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

resource "aws_launch_template" "app_lt" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = data.aws_ami.ecs_optimized.id
  instance_type = "t3.medium"
  key_name      = var.key_name

  # USAMOS EL PERFIL DE IAM DE ACADEMY
  iam_instance_profile {
    name = data.aws_iam_instance_profile.lab_profile.name 
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.ecs_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo "ECS_CLUSTER=${var.project_name}-cluster" >> /etc/ecs/ecs.config
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = { Name = "${var.project_name}-ecs-node" }
  }
}

resource "aws_autoscaling_group" "app_asg" {
  name                = "${var.project_name}-asg"
  desired_capacity    = 2
  max_size            = 4
  min_size            = 1
  vpc_zone_identifier = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }
  
  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}