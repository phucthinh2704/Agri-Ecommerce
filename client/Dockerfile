# File: client/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Quan trọng: Thêm --host để Vite chấp nhận kết nối từ bên ngoài container
CMD ["npm", "run", "dev", "--", "--host"]