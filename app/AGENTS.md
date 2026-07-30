# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Expo App Folder structure

src
│
├──app
│   ├──onboarding
│   │
│   ├──auth
│   │   ├──signin.tsx
│   │   ├──signup.tsx
│   │   ├──forgot-password.tsx
│   │   ├──otp-verification.tsx
│   │   └──reset-password.tsx
│   │
│   ├──(tabs)
│   │   └──index.tsx
│   │
│   └──_layout.tsx
│ 
├──components
│     └──ui
│        ├──CustomHeader.tsx
│        ├──CustomInput.tsx
│        ├──CustomSwitch.tsx
│        ├──CustomModal.tsx
│        ├──CustomBottomSheet.tsx
│        └──CustomButton.tsx 
│
├──redux
│ ├──api
│ │  └──baseApi.ts
│ ├──slices
│ │  └──authSlice.ts
│ │ 
│ └──store.ts
│
└──utils
   └──useTheme.ts

