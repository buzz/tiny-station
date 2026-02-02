ARG BASE_IMAGE=alpine:3.23
FROM ${BASE_IMAGE} AS builder

RUN apk update && \
    apk upgrade && \
    apk add --upgrade --no-cache --virtual=build-dependencies \
      autoconf \
      automake \
      build-base \
      libtool \
      tar \
      wget \
      curl-dev \
      libogg-dev \
      libtheora-dev \
      libvorbis-dev \
      libxml2-dev \
      libxslt-dev \
      openssl-dev \
      rhash-dev \
      speex-dev && \
    mkdir -p /tmp/libigloo && \
    wget -q -O - \
      https://downloads.xiph.org/releases/igloo/libigloo-0.9.5.tar.gz \
      | tar -xz -C /tmp/libigloo --strip-components=1 && \
    cd /tmp/libigloo && \
    ./configure --prefix=/usr/local && \
    make LDFLAGS+=-s && \
    make install && \
    mkdir -p /tmp/icecast && \
    wget -q -O - \
      https://downloads.xiph.org/releases/icecast/icecast-2.5.0.tar.gz \
      | tar -xz -C /tmp/icecast --strip-components=1 && \
    cd /tmp/icecast && \
    ./configure \
      --prefix=/usr/local \
      --sysconfdir=/etc \
      --with-curl \
      --disable-yp && \
    make LDFLAGS+=-s && \
    make install

FROM ${BASE_IMAGE}

RUN addgroup -S icecast && \
    adduser -S icecast && \
    apk update && \
    apk upgrade && \
    mkdir -p \
      /etc/icecast \
      /usr/local/icecast/logs  && \
    apk add --upgrade --no-cache \
      curl \
      envsubst \
      libogg \
      libtheora \
      libvorbis \
      libxml2 \
      libxslt \
      mailcap \
      openssl \
      rhash \
      speex \
      tzdata

COPY --from=builder /usr/local/bin/icecast /usr/local/bin/
COPY --from=builder /usr/local/lib/libigloo* /usr/local/lib/
COPY --from=builder /usr/local/share/icecast /usr/local/share/icecast
COPY icecast.dist.xml /usr/local/share/icecast/doc/icecast.xml.dist
COPY entrypoint.sh /usr/local/bin/

EXPOSE 4443/tcp
VOLUME ["/etc/certificates"]
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
