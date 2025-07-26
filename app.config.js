import 'dotenv/config';

export default {
  "expo": {
    "name": "okuafopa",
    "slug": "okuafopa",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/logo-green.png",
    "scheme": "okuafopa",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/splash-screen.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.johnabednegojilima.okuafopa"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/logo-green.png"
    },
    "splash": {
      "image": "./assets/images/splash-screen.png",
      "resizeMode": "contain",
      "backgroundColor": "#025F3B"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-screen.png",
          "resizeMode": "contain",
          "backgroundColor": "#025F3B"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "ad3590f9-0916-44ee-a7c7-d2d68884b48c"
      },
      "CLOUDINARY_CLOUD_NAME": process.env.CLOUDINARY_CLOUD_NAME,
      "CLOUDINARY_UPLOAD_PRESET": process.env.CLOUDINARY_UPLOAD_PRESET,
    }
  }
}
