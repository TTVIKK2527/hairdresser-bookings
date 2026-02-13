FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update \
  && apt-get install -y --no-install-recommends libsqlite3-dev \
  && rm -rf /var/lib/apt/lists/* \
  && a2enmod rewrite \
  && sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/000-default.conf \
  && sed -ri "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf \
  && docker-php-ext-install pdo pdo_sqlite

WORKDIR /var/www/html

COPY . /var/www/html

RUN mkdir -p /var/www/html/data \
  && chown -R www-data:www-data /var/www/html/data

EXPOSE 80
