# Usa una imagen base de Node.js en Alpine para minimizar el tamaño
FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo de dependencias y el package-lock.json si existe
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Ejecuta la generación del cliente de Prisma
RUN npx prisma generate

# Compila la aplicación
RUN npm run build

# Etapa final, usa una imagen ligera solo con lo necesario para ejecutar la app
FROM node:20-alpine

# Crear un usuario no root para mayor seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Establece la variable de entorno del puerto
ENV PORT=3000

# Establece el directorio de trabajo
WORKDIR /app

# Copia las dependencias y la aplicación compilada desde la etapa de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

# Expone el puerto de la aplicación
EXPOSE $PORT

# Cambia al usuario no root
USER appuser

# Comando para ejecutar la aplicación
CMD ["node", "dist/main.js"]
