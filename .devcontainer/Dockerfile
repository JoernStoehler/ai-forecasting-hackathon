FROM mcr.microsoft.com/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND=noninteractive

SHELL ["/bin/bash", "-lc"]

# -----------------------------------------------------------------------------
# Devcontainer image for msc-viterbo
#
# Design goals:
# - Keep the image simple and close to standard devcontainer patterns (KISS).
# - Install heavyweight, rarely changing dependencies in earlier layers so they
#   are cached across rebuilds.
# - Install more frequently tweaked tools (Node/npm packages) after base deps.
# - Install language toolchains (Node/npm) once for the dev user here rather
#   than in postCreate, so they are baked into the image.
# -----------------------------------------------------------------------------

# Base CLI utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    gh \
    ripgrep \
    jq \
    ca-certificates \
    tree \
    entr \
    inotify-tools \
    universal-ctags \
    python3 \
    python3-yaml \
    && rm -rf /var/lib/apt/lists/*

# Node.js 22.x (with npm)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && node -v && npm -v

# Playwright runtime dependencies (browsers are cached via mount).
# Use Playwright's install-deps to get all required system libraries.
RUN npx playwright install-deps

# VS Code tunnel CLI (bake into image to avoid slow install on postCreate)
RUN set -eux; \
    tmpdir="$(mktemp -d)"; \
    curl -fsSL "https://update.code.visualstudio.com/latest/cli-linux-x64/stable" -o "$tmpdir/vscode-cli.tar.gz"; \
    tar -xzf "$tmpdir/vscode-cli.tar.gz" -C "$tmpdir"; \
    install -m 0755 "$tmpdir/code" /usr/local/bin/code-tunnel; \
    rm -rf "$tmpdir"

USER vscode
ENV HOME=/home/vscode
WORKDIR /workspaces/ai-forecasting-hackathon
