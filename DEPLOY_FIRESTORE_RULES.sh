#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "LittleBear - deploying Firestore rules to my-react-app-d5e78"
npx --yes firebase-tools@latest login
npx --yes firebase-tools@latest use my-react-app-d5e78
npx --yes firebase-tools@latest deploy --only firestore:rules --project my-react-app-d5e78
echo "Firestore rules deployed successfully."
