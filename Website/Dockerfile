# # Use the official Node.js 18 image as the base image
# FROM node:18-alpine AS base

# FROM base AS deps

# RUN apk add --no-cache libc6-compat

# WORKDIR /app

# COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# RUN \
#     if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#     elif [ -f package-lock.json ]; then npm ci; \
#     elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
#     else echo "No lock file found"; exit 1; fi

# FROM base AS builder

# WORKDIR /app

# COPY --from=deps /app/node_modules ./node_modules
# COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

# RUN npm run build

# FROM base AS runner
# WORKDIR /app

# ENV NEXT_TELEMETRY_DISABLED 1

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 --ingroup nodejs nextjs

# COPY --from=builder /app/public ./public

# RUN mkdir .next
# RUN chown nextjs:nodejs .next

# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# USER nextjs

# EXPOSE 3000

# ENV PORT 3000

# ENV HOSTNAME "0.0.0.0"

# CMD ["node", "server.js"]


# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the Next.js project into the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run Next.js application
CMD ["npm", "start"]
# CMD ["node", ".next/standalone/server.js"]