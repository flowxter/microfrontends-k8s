# 1. Usa una imagen base de Node
FROM node:18-alpine

# 2. Establece el directorio de trabajo DENTRO del contenedor
WORKDIR /app

# 3. Copia el package.json que está DENTRO de la subcarpeta 'app/'
COPY app/package.json .

# 4. Instala dependencias
RUN npm install --production

# 5. Copia el resto de la aplicación (server.js, static/, templates/)
# Copia el CONTENIDO de TW-tasks/app/ a /app en el contenedor
COPY app/ .

# 6. Define el puerto
EXPOSE 8084

# 7. Comando de inicio
CMD ["node", "server.js"]