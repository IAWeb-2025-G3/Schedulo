# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY package.json pnpm-lock.yaml ./
COPY .npmrc .npmrc
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG ADMIN_PASSWORD=dummy-build-value
ARG ORGANIZER_SESSION_SECRET=dummy-build-secret-32-chars-minimum
ENV ADMIN_PASSWORD=$ADMIN_PASSWORD
ENV ORGANIZER_SESSION_SECRET=$ORGANIZER_SESSION_SECRET

RUN pnpm build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATA_DIR=/data

RUN mkdir -p /data/polls

COPY --from=builder /app/ /app/

VOLUME ["/data"]
EXPOSE 3000

CMD ["pnpm", "start"]