FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HUSKY=0
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY apps/video-worker /app/apps/video-worker
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter video-worker run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/video-worker/node_modules /app/apps/video-worker/node_modules
COPY --from=build /app/apps/video-worker/dist /app/apps/video-worker/dist
EXPOSE 3000
CMD [ "pnpm", "--filter", "video-worker", "start" ]
