FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter web build

FROM base
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/apps/web /usr/src/app/apps/web
COPY --from=build /usr/src/app/packages /usr/src/app/packages
COPY --from=build /usr/src/app/package.json /usr/src/app/package.json
COPY --from=build /usr/src/app/pnpm-workspace.yaml /usr/src/app/pnpm-workspace.yaml

WORKDIR /usr/src/app/apps/web
EXPOSE 3005
ENV PORT=3005
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
