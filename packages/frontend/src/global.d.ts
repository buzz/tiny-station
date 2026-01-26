/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_BASE_URL: string
  readonly VITE_COOKIE_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace JSX {
    interface ElementAttributesProperty {
      className: string
    }
  }
}
