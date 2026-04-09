export interface Client {
  id: string;
  name: string;
  slug: string;
  allowed_origins: string;
  system_prompt: string;
  welcome_message: string;
  theme_color: string;
  max_tokens: number;
  model_name: string;
  is_active: boolean;
}

export interface APIKey {
  id: string;
  key_prefix: string;
  rate_limit_rpm: number;
  rate_limit_rpd: number;
  is_active: boolean;
}

export interface APIKeyCreateResponse extends APIKey {
  raw_key: string;
}
