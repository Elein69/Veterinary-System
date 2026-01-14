# compute.tf

# 1. Buscar imagen Amazon Linux 2023
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# 2. Instancia Bastion (Jumpbox)
resource "aws_instance" "jumpbox" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_1.id
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  # --- CONFIGURACIÓN AUTOMÁTICA ---
  user_data = base64encode(<<-EOF
              #!/bin/bash
              
              # A. Instalar herramientas
              dnf update -y
              dnf install -y docker postgresql15 git wget tar gcc make
              
              # B. Iniciar InfluxDB (Docker)
              service docker start
              systemctl enable docker
              usermod -a -G docker ec2-user
              docker run -d --name influxdb -p 8086:8086 influxdb:2.7

              # C. Instalar Cloudflared (Túnel)
              curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
              rpm -ivh cloudflared.rpm

              # D. Instalar sshpass (Para password automatico)
              cd /tmp
              wget http://sourceforge.net/projects/sshpass/files/sshpass/1.09/sshpass-1.09.tar.gz
              tar -xvf sshpass-1.09.tar.gz
              cd sshpass-1.09
              ./configure
              make
              make install
              
              # Preparar directorios
              mkdir -p /home/ec2-user/scripts
              chown ec2-user:ec2-user /home/ec2-user/scripts

              # ==========================================
              # E. SCRIPT 1: BACKUP AUTOMÁTICO (ENVÍA A UCE)
              # ==========================================
              cat <<EOT >> /home/ec2-user/scripts/backup_uce.sh
              #!/bin/bash
              FECHA=\$(date +%F) # Formato YYYY-MM-DD
              ARCHIVO="backup_\$FECHA.sql"
              
              # Detectar ambiente
              ENV_FOLDER="QA"
              if [[ "${var.project_name}" == *"prod"* ]]; then
                 ENV_FOLDER="PROD"
              fi
              
              echo "--- Iniciando Backup Automático (\$FECHA) ---"
              
              # 1. Dumpear la DB de AWS RDS
              PGPASSWORD='${var.db_password}' pg_dump -h ${aws_db_instance.postgres_db.address} -U ${var.db_username} --clean --if-exists -d postgres > /tmp/\$ARCHIVO

              # 2. Enviar a UCE (On-Premise)
              sshpass -p 'useruce1' scp -o "ProxyCommand=cloudflared access ssh --hostname server.distribuidauce.org" -o StrictHostKeyChecking=no /tmp/\$ARCHIVO distribuida@server.distribuidauce.org:/home/distribuida/Documents/distribuida2/Elein_Inaquiza/\$ENV_FOLDER/

              # 3. Limpiar
              rm /tmp/\$ARCHIVO
              echo "Backup enviado exitosamente."
              EOT

              # ==========================================
              # F. SCRIPT 2: RESTORE A PETICIÓN (TRAE DE UCE)
              # ==========================================
              cat <<EOT >> /home/ec2-user/scripts/restore_uce.sh
              #!/bin/bash
              
              # Detectar ambiente
              ENV_FOLDER="QA"
              if [[ "${var.project_name}" == *"prod"* ]]; then
                 ENV_FOLDER="PROD"
              fi

              echo "============================================="
              echo " SISTEMA DE RECUPERACIÓN DE DESASTRES (DRP)  "
              echo " Ambiente actual: \$ENV_FOLDER                 "
              echo "============================================="
              echo "Ingrese la fecha del backup a restaurar (Formato YYYY-MM-DD):"
              read FECHA_RESTORE
              
              ARCHIVO="backup_\$FECHA_RESTORE.sql"
              RUTA_REMOTA="/home/distribuida/Documents/distribuida2/Elein_Inaquiza/\$ENV_FOLDER/\$ARCHIVO"
              
              echo "1. Buscando archivo \$ARCHIVO en el servidor de la UCE..."
              
              # Descargar desde UCE a AWS
              sshpass -p 'useruce1' scp -o "ProxyCommand=cloudflared access ssh --hostname server.distribuidauce.org" -o StrictHostKeyChecking=no distribuida@server.distribuidauce.org:\$RUTA_REMOTA /tmp/\$ARCHIVO
              
              if [ -f "/tmp/\$ARCHIVO" ]; then
                  echo "Archivo descargado correctamente."
                  echo "ATENCIÓN: Esto borrará los datos actuales y pondrá los de la fecha \$FECHA_RESTORE."
                  echo "Presione ENTER para confirmar o Ctrl+C para cancelar..."
                  read confirmacion
                  
                  echo "2. Restaurando base de datos en AWS RDS..."
                  PGPASSWORD='${var.db_password}' psql -h ${aws_db_instance.postgres_db.address} -U ${var.db_username} -d postgres < /tmp/\$ARCHIVO
                  
                  echo "¡Restauración completada con éxito!"
                  rm /tmp/\$ARCHIVO
              else
                  echo "ERROR: No se encontró un backup con la fecha \$FECHA_RESTORE en el servidor de la UCE."
              fi
              EOT

              # G. Permisos y CRON
              chmod +x /home/ec2-user/scripts/*.sh
              chown -R ec2-user:ec2-user /home/ec2-user/scripts
              
              # Programar el backup automático todos los días a las 02:00 AM
              echo "0 2 * * * /home/ec2-user/scripts/backup_uce.sh >> /var/log/backup.log 2>&1" | crontab -
              EOF
  )

  tags = {
    Name = "${var.project_name}-JumpBox"
  }
}

resource "aws_eip" "bastion_eip" {
  instance = aws_instance.jumpbox.id
  domain   = "vpc"
  tags     = { Name = "${var.project_name}-bastion-eip" }
}