# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Bundle app source
COPY . .



EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "dev"]
