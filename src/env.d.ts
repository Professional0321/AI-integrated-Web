/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_HF_API_TOKEN?: string;
  readonly VITE_DEFAULT_PROVIDER?: 'openai' | 'huggingface';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
