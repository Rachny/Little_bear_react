# LittleBear + Firebase — exact setup

## 1. Install dependencies

Open a terminal inside this `little-bear` folder:

```bash
npm install
```

## 2. Check `.env.local`

This ZIP already contains the Firebase web configuration that was in your project. If your Firebase project is different, replace the values using Firebase Console → Project settings → Your apps → Web app.

The file must be named exactly:

`.env.local`

After changing it, stop and restart Vite.

## 3. Enable Email/Password authentication

Firebase Console → Authentication → Sign-in method → Email/Password → Enable → Save.

## 4. Create Firestore

Firebase Console → Firestore Database → Create database.

For a school/demo project, choose a nearby location and finish the setup. Do not use production test rules; this project includes its own rules.

## 5. Deploy Firestore rules

Install Firebase CLI if needed:

```bash
npm install -g firebase-tools
```

Then:

```bash
firebase login
firebase use my-react-app-d5e78
firebase deploy --only firestore:rules
```

If your Firebase project has another ID, replace `my-react-app-d5e78` and also update `.firebaserc`.

## 6. Start the website

```bash
npm run dev
```

Open the local URL shown by Vite.

## 7. Create the admin account

Open `/login` and use:

- Email: `admin@littlebear.com`
- Password: `Admin123!`

The app creates this Firebase Authentication account automatically the first time you log in with those exact credentials.

## 8. Initialize products

Open `/admin`.

If the `products` collection is empty, click **Initialize products**. The 15 starter products will be written to Firestore.

After that:

- Shop reads products from Firestore.
- Admin Add Product writes to Firestore.
- Admin Update Product writes to Firestore.
- Admin Delete Product deletes from Firestore.
- Stock +/- updates Firestore.
- Customer checkout writes to `orders`.
- Admin Dashboard reads `orders` in real time.
- Admin can change order status.

## 9. Important

Do not expect Firestore to work until both of these are done:

1. Firestore Database has been created.
2. The included `firestore.rules` has been deployed to the same Firebase project used by `.env.local`.

If checkout still fails, copy the red Firebase error shown on the Cart page and send it to ChatGPT. Do not send service-account JSON files or private credentials.
