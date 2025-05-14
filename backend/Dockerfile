# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]