# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Checkout / Firebase Orders Fix

The checkout now saves orders to Firestore with a timeout and clear Firebase errors instead of remaining stuck on “Placing order…”. The admin account is also a real Firebase Authentication account, so the Admin Dashboard can securely read the `orders` collection.

Demo admin login:
- Email: `admin@littlebear.com`
- Password: `Admin123!`

If Firestore rules are not already configured, deploy the included `firestore.rules` (for example with Firebase CLI: `firebase deploy --only firestore:rules`). Firestore Database must also be enabled in the Firebase console.
