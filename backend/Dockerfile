FROM dunglas/frankenphp:1-php8.3

WORKDIR /app

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .

RUN composer install --no-dev --prefer-dist --optimize-autoloader

ENV SERVER_NAME=:8080
EXPOSE 8080

CMD ["frankenphp", "php-server", "-r", "public/"]
