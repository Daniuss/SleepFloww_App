import type { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

function translateAuthError(error: AuthError | Error): string {
  const msg = error.message;

  const rateLimit = msg.match(/after (\d+) seconds/i);
  if (rateLimit) return `Muitas tentativas seguidas. Espere ${rateLimit[1]}s e tente de novo.`;

  if (msg.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos. Se ainda não tem conta, toque em "Criar conta" abaixo.';
  }
  if (msg.includes('already registered')) {
    return 'Já existe uma conta com esse e-mail. Toque em "Entrar" abaixo.';
  }
  if (msg.includes('Password should be at least')) return 'Senha precisa ter pelo menos 6 caracteres';
  if (msg.includes('Unable to validate email') || msg.includes('is invalid')) return 'E-mail inválido';
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

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: name ? { data: { full_name: name } } : undefined,
  });
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
