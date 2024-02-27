#!/bin/bash
output_dir="./mock-certs"

mkdir -p "$output_dir"

expiring_certificate_file="expiring-cert.pem"
expiring_private_key_file="expiring-key.pem"

expired_certificate_file="expired-cert.pem"
expired_private_key_file="expired-key.pem"

valid_certificate_file="valid-cert.pem"
valid_private_key_file="valid-key.pem"


common_name="example.com"
valid_days=23 


# Expiring cert
openssl req -x509 -nodes -newkey rsa:2048 -keyout "$output_dir/$expiring_private_key_file" -out "$output_dir/$expiring_certificate_file" -days "$valid_days" -subj "/CN=$common_name"


#expired cert
faketime '3 days ago' openssl req -x509 -sha256 -days 1 \
    -keyout "$output_dir/$expired_private_key_file" \
    -out "$output_dir/$expired_certificate_file" \
    -subj "/CN=$common_name" \
    -nodes


# valid cert
valid_days=60
openssl req -x509 -nodes -newkey rsa:2048 -keyout "$output_dir/$valid_private_key_file" -out "$output_dir/$valid_certificate_file" -days "$valid_days" -subj "/CN=$common_name"
