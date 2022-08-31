############################################################
# Dockerfile to build React and Node App
# Based on Ubuntu – by default here the latest version
############################################################

# TODO: Before running, make sure to remove package-lock.json and build folder from client and both node_modules folders.
# NOTE: On first run, this will take a long time due to package installations... please be patient

# Set the base image to Ubuntu
FROM ubuntu:latest

# File Author / Maintainer
MAINTAINER n10771727

# Install basic applications and node + npm
RUN apt-get update && apt-get install -y \
build-essential \
curl \
dialog \
git \
net-tools \
tar \
nodejs \
npm \
wget

# Copy project folder
COPY /fullstack /fullstack

# Set dir to project folder
WORKDIR /fullstack

# Ensure node and npm are updated
RUN npm install -g npm n && n stable && node --version

# Install and build for prod for client folder
RUN cd client && npm install && npm run build

# Install for server folder
RUN ls & cd server && npm install

# Expose port 3000
EXPOSE 3000

# Start the server
CMD cd server && npm start
