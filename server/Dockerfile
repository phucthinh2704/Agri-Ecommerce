# File: server/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package để cài library trước (tối ưu cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code
COPY . .

# Mở cổng 5000 theo file .env
EXPOSE 5000

# Chạy server (lệnh dev dùng nodemon như trong package.json)
CMD ["npm", "run", "dev"]