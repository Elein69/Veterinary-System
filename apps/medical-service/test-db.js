const http = require('http');

http.get('http://localhost:8000', (res) => {
  console.log('✅ Conexión a DynamoDB exitosa. Estado:', res.statusCode);
}).on('error', (e) => {
  console.error('❌ No se pudo conectar a DynamoDB en localhost:8000. Asegúrate de que el contenedor esté corriendo.');
});