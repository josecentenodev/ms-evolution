# 🚀 Evolution API Adapter - Guía de Configuración

## 📋 **Configuración Inicial**

### **1. Clonar el Repositorio**
```bash
git clone <tu-repositorio>
cd ms-evolution
```

### **2. Configurar Variables de Entorno**

#### **A. Evolution API**
```bash
# Copiar el archivo de ejemplo
cp evolution.env.example evolution.env

# Editar con tus credenciales
nano evolution.env
```

**Variables importantes a cambiar:**
```bash
AUTHENTICATION_API_KEY=tu-api-key-real-aqui
```

#### **B. Evolution Adapter**
```bash
# Copiar el archivo de ejemplo
cp adapter/env.example adapter/.env

# Editar con tus credenciales
nano adapter/.env
```

**Variables importantes a cambiar:**
```bash
EVOLUTION_API_KEY=tu-api-key-real-aqui
JWT_SECRET=tu-jwt-secret-real-aqui
```

### **3. Configurar Docker Compose**
```bash
# Copiar el archivo de ejemplo
cp docker-compose.example.yml docker-compose.yml

# Editar con tus credenciales
nano docker-compose.yml
```

**Variables importantes a cambiar:**
```yaml
AUTHENTICATION_API_KEY=tu-api-key-real-aqui
```

### **4. Generar API Keys Seguras**

```bash
# Ejecutar el script de generación
node generate-keys.js
```

**El script generará:**
- Evolution API Key
- JWT Secret
- Adapter API Key

### **5. Ejecutar los Servicios**

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker ps
```

## 🔑 **API Keys y Credenciales**

### **Evolution API Key**
- **Ubicación**: `evolution.env` y `docker-compose.yml`
- **Uso**: Autenticación para Evolution API
- **Formato**: String hexadecimal de 64 caracteres

### **JWT Secret**
- **Ubicación**: `adapter/.env`
- **Uso**: Firmar tokens JWT para el adapter
- **Formato**: String hexadecimal de 128 caracteres

### **Adapter API Key**
- **Ubicación**: `adapter/.env`
- **Uso**: Comunicación entre adapter y Evolution API
- **Formato**: String hexadecimal de 64 caracteres

## 🛡️ **Seguridad**

### **Archivos Protegidos por .gitignore**
- ✅ `evolution.env` - Variables de Evolution API
- ✅ `adapter/.env` - Variables del adapter
- ✅ `docker-compose.yml` - Configuración con credenciales
- ✅ `generate-keys.js` - Script de generación de keys
- ✅ `adapter/logs/` - Logs de la aplicación
- ✅ `*.session` - Archivos de sesión de WhatsApp

### **Archivos Seguros para Git**
- ✅ `docker-compose.example.yml` - Ejemplo sin credenciales
- ✅ `evolution.env.example` - Ejemplo sin credenciales
- ✅ `adapter/.env.example` - Ejemplo sin credenciales
- ✅ `README.md` - Documentación
- ✅ `SETUP.md` - Esta guía

## 🚨 **Importante**

### **NUNCA subas a Git:**
- Archivos `.env` con credenciales reales
- `docker-compose.yml` con API keys
- Logs con información sensible
- Archivos de sesión de WhatsApp

### **SÍ puedes subir a Git:**
- Archivos de ejemplo (`.example`)
- Código fuente del adapter
- Documentación
- README y guías

## 🔧 **Troubleshooting**

### **Problema: Evolution API no inicia**
```bash
# Verificar logs
docker-compose logs evolution_api

# Verificar variables de entorno
docker-compose exec evolution_api env | grep AUTHENTICATION
```

### **Problema: Adapter no conecta con Evolution API**
```bash
# Verificar logs del adapter
docker-compose logs evolution_adapter

# Verificar conectividad
docker-compose exec evolution_adapter ping evolution_api
```

### **Problema: Base de datos no conecta**
```bash
# Verificar PostgreSQL
docker-compose logs evolution_postgres

# Verificar conectividad
docker-compose exec evolution_api ping postgres_evolution
```

## 📞 **Soporte**

Si tienes problemas con la configuración:

1. **Verificar logs**: `docker-compose logs -f`
2. **Reiniciar servicios**: `docker-compose down && docker-compose up -d`
3. **Verificar archivos**: Asegúrate de que los archivos `.env` existen
4. **Verificar credenciales**: Confirma que las API keys son correctas

---

**⚠️ Recuerda: Mantén tus credenciales seguras y nunca las subas a Git!** 