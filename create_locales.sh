#!/bin/bash

# List of supported languages
languages=(
  'en' 'es' 'fr' 'de' 'it' 'zh' 'ja' 'ko' 'ar' 'pt' 'ru' 'hi' 'bn' 'pa' 'id' 'ms' 'th' 'vi' 'pl' 'uk' 'sv' 'no' 'da' 'fi' 'nl' 'tr' 'el' 'he' 'cs' 'sk' 'hu' 'ro' 'bg' 'sr' 'hr' 'sl' 'lt' 'lv' 'et' 'is' 'mt' 'ga' 'cy' 'sq' 'bs' 'mk' 'sw' 'am' 'ne' 'si' 'ml' 'ta' 'te' 'kn' 'gu' 'mr' 'ur' 'mn' 'my' 'ka' 'hy' 'az' 'kk'
)

# Create the locales directory if it doesn't exist
mkdir -p locales

# Loop through the languages and create the JSON files
for lang in "${languages[@]}"; do
  echo "{}" > "locales/$lang.json"
done

echo "Locale files created successfully!"

