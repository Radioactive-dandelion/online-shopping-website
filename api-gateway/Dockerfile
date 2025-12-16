# 1. Use a small Node.js base image
FROM node:20-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package files and tsconfig
COPY package*.json ./
COPY tsconfig.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the source code
COPY src ./src

# 6. Build TypeScript -> JavaScript
RUN npm run build

# 7. Expose port 3000 (API Gateway)
EXPOSE 3000

# 8. Start the app in production mode
CMD ["npm", "start"]
