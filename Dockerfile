# Use Bun as the base image
FROM oven/bun:1

ARG NODE_ENV=production
ARG NEXT_PUBLIC_MAIN_SITE
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_MAIN_SITE=${NEXT_PUBLIC_MAIN_SITE}
ARG NEXT_PUBLIC_EXPRESS_ENDPOINT
ENV NEXT_PUBLIC_EXPRESS_ENDPOINT=${NEXT_PUBLIC_EXPRESS_ENDPOINT}
ARG NEXT_PUBLIC_VERIFICATION_ENDPOINT
ENV NEXT_PUBLIC_VERIFICATION_ENDPOINT=${NEXT_PUBLIC_VERIFICATION_ENDPOINT}

# Set the working directory
WORKDIR /app

# Install system dependencies for native module compilation
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set Python environment variable for node-gyp
ENV PYTHON=/usr/bin/python3

# Copy package.json and bun.lockb separately to leverage Docker cache
COPY package.json bun.lockb* ./

# Install dependencies with Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Expose the application port
EXPOSE 3002

# Set default environment variable
ENV NODE_ENV=production

# Start the application with Bun
CMD ["bun", "start"]
