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

# 2. Instancia Bastion (Jumpbox + Brokers)
resource "aws_instance" "jumpbox" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.small" # CAMBIO: Subimos a t3.small para aguantar Kafka+Rabbit
  subnet_id              = aws_subnet.public_1.id
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  # --- CONFIGURACIÓN AUTOMÁTICA ---
  user_data = base64encode(<<-EOF
              #!/bin/bash
              
              # A. Instalar herramientas base
              dnf update -y
              dnf install -y docker postgresql15 git wget tar gcc make
              
              # Iniciar Docker
              service docker start
              systemctl enable docker
              usermod -a -G docker ec2-user

              # B. Obtener IP Privada (Necesaria para Kafka)
              PRIVATE_IP=$(hostname -I | awk '{print $1}')

              # ==========================================
              # C. INSTALACIÓN DE BROKERS (MESSAGING)
              # ==========================================

              # 1. KAFKA (Puerto 9092) - Modo ligero KRaft
              docker run -d --name kafka \
                --restart always \
                -p 9092:9092 \
                -e KAFKA_NODE_ID=1 \
                -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT \
                -e KAFKA_ADVERTISED_LISTENERS=INTERNAL://$${PRIVATE_IP}:9092,EXTERNAL://localhost:9092 \
                -e KAFKA_LISTENERS=INTERNAL://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093,EXTERNAL://0.0.0.0:29092 \
                -e KAFKA_INTER_BROKER_LISTENER_NAME=INTERNAL \
                -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
                -e KAFKA_PROCESS_ROLES=broker,controller \
                -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
                -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
                -e KAFKA_HEAP_OPTS="-Xmx400M -Xms400M" \
                apache/kafka:3.7.0

              # 2. RABBITMQ (Puerto 5672)
              docker run -d --name rabbitmq \
                --restart always \
                -p 5672:5672 -p 15672:15672 \
                -e RABBITMQ_DEFAULT_USER=${var.db_username} \
                -e RABBITMQ_DEFAULT_PASS=${var.db_password} \
                rabbitmq:3.12-management

              # 3. MQTT (Mosquitto) (Puerto 1883)
              mkdir -p /mosquitto/config
              echo "listener 1883" > /mosquitto/config/mosquitto.conf
              echo "allow_anonymous true" >> /mosquitto/config/mosquitto.conf
              
              docker run -d --name mosquitto \
                --restart always \
                -p 1883:1883 \
                -v /mosquitto/config:/mosquitto/config \
                eclipse-mosquitto

              # 4. INFLUXDB (Tu configuración original)
              docker run -d --name influxdb -p 8086:8086 influxdb:2.7

              # ==========================================
              # D. TUS SCRIPTS ORIGINALES (Cloudflare & Backups)
              # ==========================================

              # Instalar Cloudflared
              curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
              rpm -ivh cloudflared.rpm

              # Instalar sshpass
              cd /tmp
              wget http://sourceforge.net/projects/sshpass/files/sshpass/1.09/sshpass-1.09.tar.gz
              tar -xvf sshpass-1.09.tar.gz
              cd sshpass-1.09
              ./configure
              make
              make install
              
              # Directorios y Scripts de Backup UCE
              mkdir -p /home/ec2-user/scripts
              chown ec2-user:ec2-user /home/ec2-user/scripts

              # SCRIPT 1: BACKUP UCE
              cat <<EOT >> /home/ec2-user/scripts/backup_uce.sh
              #!/bin/bash
              FECHA=\$(date +%F)
              ARCHIVO="backup_\$FECHA.sql"
              ENV_FOLDER="QA"
              if [[ "${var.project_name}" == *"prod"* ]]; then ENV_FOLDER="PROD"; fi
              echo "--- Iniciando Backup Automático (\$FECHA) ---"
              PGPASSWORD='${var.db_password}' pg_dump -h ${aws_db_instance.postgres_db.address} -U ${var.db_username} --clean --if-exists -d postgres > /tmp/\$ARCHIVO
              sshpass -p 'useruce1' scp -o "ProxyCommand=cloudflared access ssh --hostname server.distribuidauce.org" -o StrictHostKeyChecking=no /tmp/\$ARCHIVO distribuida@server.distribuidauce.org:/home/distribuida/Documents/distribuida2/Elein_Inaquiza/\$ENV_FOLDER/
              rm /tmp/\$ARCHIVO
              echo "Backup enviado exitosamente."
              EOT

              # SCRIPT 2: RESTORE UCE (Resumido para ahorrar espacio, funciona igual)
              cat <<EOT >> /home/ec2-user/scripts/restore_uce.sh
              #!/bin/bash
              ENV_FOLDER="QA"
              if [[ "${var.project_name}" == *"prod"* ]]; then ENV_FOLDER="PROD"; fi
              echo "Ingrese fecha (YYYY-MM-DD):"
              read FECHA_RESTORE
              ARCHIVO="backup_\$FECHA_RESTORE.sql"
              RUTA_REMOTA="/home/distribuida/Documents/distribuida2/Elein_Inaquiza/\$ENV_FOLDER/\$ARCHIVO"
              sshpass -p 'useruce1' scp -o "ProxyCommand=cloudflared access ssh --hostname server.distribuidauce.org" -o StrictHostKeyChecking=no distribuida@server.distribuidauce.org:\$RUTA_REMOTA /tmp/\$ARCHIVO
              if [ -f "/tmp/\$ARCHIVO" ]; then
                  PGPASSWORD='${var.db_password}' psql -h ${aws_db_instance.postgres_db.address} -U ${var.db_username} -d postgres < /tmp/\$ARCHIVO
                  rm /tmp/\$ARCHIVO
              else
                  echo "Error: No encontrado"
              fi
              EOT

              chmod +x /home/ec2-user/scripts/*.sh
              chown -R ec2-user:ec2-user /home/ec2-user/scripts
              echo "0 2 * * * /home/ec2-user/scripts/backup_uce.sh >> /var/log/backup.log 2>&1" | crontab -
              EOF
  )

  tags = {
    Name = "${var.project_name}-JumpBox-Brokers"
  }
}

resource "aws_eip" "bastion_eip" {
  instance = aws_instance.jumpbox.id
  domain   = "vpc"
  tags     = { Name = "${var.project_name}-bastion-eip" }
}