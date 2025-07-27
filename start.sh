#!/bin/bash

# Set Apache to listen on Railway's PORT
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf

# Start Apache
apache2-foreground 