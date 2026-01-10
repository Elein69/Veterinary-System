data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "jumpbox" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public_1.id
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  # --- SUPER SCRIPT: InfluxDB + Tunnel + Backups ---
  user_data = base64encode(<<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y postgresql15 docker
              
              # 1. Iniciar Docker y correr INFLUXDB (Base de datos Series de Tiempo)
              service docker start
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              docker run -d --name influxdb -p 8086:8086 -v /home/ec2-user/influx_data:/var/lib/influxdb2 influxdb:2.7

              # 2. Instalar Cloudflared (Conexión On-Premise)
              curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
              rpm -ivh cloudflared.rpm
              
              # 3. Script de Backup Automático
              mkdir -p /home/ec2-user/scripts
              cat <<EOT >> /home/ec2-user/scripts/backup_daily.sh
              #!/bin/bash
              FECHA=\$(date +%F)
              ARCHIVO="backup_\$FECHA.sql"
              
              # Dump de RDS
              PGPASSWORD='${var.db_password}' pg_dump -h ${aws_db_instance.postgres_db.address} -U ${var.db_username} -d postgres > /tmp/\$ARCHIVO
              
              # Enviar a UCE (Requiere login manual 1 vez)
              scp -o "ProxyCommand=cloudflared access ssh --hostname server.distribuidauce.org" /tmp/\$ARCHIVO distribuida@server.distribuidauce.org:~/backups_veterinaria/
              
              rm /tmp/\$ARCHIVO
              EOT
              
              chmod +x /home/ec2-user/scripts/backup_daily.sh
              chown -R ec2-user:ec2-user /home/ec2-user/scripts
              
              # 4. CRON (Backup diario 2 AM)
              echo "0 2 * * * /home/ec2-user/scripts/backup_daily.sh >> /var/log/backup.log 2>&1" | crontab -
              EOF
  )

  tags = {
    Name = "${var.project_name}-JumpBox"
    Role = "Admin/Backup/InfluxDB"
  }
}

resource "aws_eip" "jumpbox_eip" {
  domain   = "vpc"
  instance = aws_instance.jumpbox.id
  tags = { Name = "${var.project_name}-jumpbox-ip" }
}