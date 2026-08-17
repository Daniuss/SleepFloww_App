import type { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

function translateAuthError(error: AuthError | Error): string {
  const msg = error.message;
  if (msg.includes('Invalid login credentials')) return 'Senha incorreta';
  if (msg.includes('already registered')) return 'Senha incorreta';
  if (msg.includes('Password should be at least')) return 'Senha precisa ter pelo menos 6 caracteres';
  if (msg.includes('Unable to validate email')) return 'E-mail inválido';
  if (msg.includes('Email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).';
  }
  return msg;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error));
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(translateAuthError(error));
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(translateAuthError(error));
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(translateAuthError(error));
  return data.session;
}

// Login e cadastro num botão só: primeiro login com um e-mail novo cria a
// conta automaticamente (comportamento igual ao backend antigo). Se a conta
// já existe e a senha bate errado, o Supabase recusa o signUp com
// "already registered", que traduzimos pra "Senha incorreta".
export async function signInOrSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return data;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw new Error(translateAuthError(signUpError));
  return signUpData;
}
