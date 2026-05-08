#!/bin/sh
# Replace hardcoded Hugging Face token with env var in the file if it exists
if [ -f src/services/huggingface.js ]; then
  perl -pi -e 's/const HF_TOKEN = .*;/const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;/' src/services/huggingface.js
fi
