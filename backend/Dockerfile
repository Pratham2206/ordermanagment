# # Use an official Node.js runtime as the base image
# FROM node:14

# # Create app directory
# WORKDIR /usr/src/app

# # Install app dependencies
# COPY package*.json ./
# RUN npm install

# # Bundle app source
# COPY . .

# # Accept build arguments
# ARG EMAIL_USER
# ARG EMAIL_PASS
# ARG ADMIN_USER
# ARG ADMIN_PASS
# ARG DB_HOST
# ARG DB_USER
# ARG DB_PASS
# ARG DB_NAME
# ARG JWT_SECRET
# ARG RAZORPAY_KEY_ID
# ARG RAZORPAY_KEY_SECRET
# ARG GOOGLE_PLACES_API_KEY
# ARG PORT
# ARG CLIENT_URL

# # Set environment variables
# ENV EMAIL_USER=$EMAIL_USER \
#     EMAIL_PASS=$EMAIL_PASS \
#     ADMIN_USER=$ADMIN_USER \
#     ADMIN_PASS=$ADMIN_PASS \
#     DB_HOST=$DB_HOST \
#     DB_USER=$DB_USER \
#     DB_PASS=$DB_PASS \
#     DB_NAME=$DB_NAME \
#     JWT_SECRET=$JWT_SECRET \
#     RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID \
#     RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET \
#     GOOGLE_PLACES_API_KEY=$GOOGLE_PLACES_API_KEY \
#     PORT=$PORT \
#     CLIENT_URL="$CLIENT_URL"

# # Expose the application port
# EXPOSE $PORT

# # Start the application
# CMD ["npm", "start"]

# Use the official Node.js image as a base
FROM node:14

# Create and set the working directory inside the container
WORKDIR /app/backend

# Copy package.json and package-lock.json to install dependencies
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all source code into the container
COPY backend /app/backend
COPY . .

# Set the environment variable to production for Docker
ENV NODE_ENV=production

#set backend directory as the working directory to match file paths in the app
WORKDIR /app/backend

# Expose the port your app runs on (adjust if necessary)
EXPOSE 5000

# Define the command to run your app
CMD ["npm", "start"]