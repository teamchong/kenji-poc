FROM buildkite/puppeteer:latest
ARG QUERY
ENV QUERY=${QUERY}
ENV PATH=${PATH}:/node_modules/.bin

ENV NODE_ENV=debug
# ENV NODE_ENV=production

ENTRYPOINT /usr/local/bin/node --no-warnings /app/src/main.js