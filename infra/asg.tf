resource "aws_launch_template" "app_lt" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"
  key_name      = var.key_name

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.bastion_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker
              service docker start
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = { Name = "${var.project_name}-node" }
  }
}

resource "aws_autoscaling_group" "app_asg" {
  name                = "${var.project_name}-asg"
  desired_capacity    = 2
  max_size            = 3
  min_size            = 1
  target_group_arns   = [aws_lb_target_group.app_tg.arn]
  vpc_zone_identifier = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }
}