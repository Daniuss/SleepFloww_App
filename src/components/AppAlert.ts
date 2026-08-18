import { Alert } from 'react-native';

// Android/iOS: repassa direto pro Alert nativo do React Native, sem
// nenhuma mudança de comportamento. A versão Web fica em AppAlert.web.tsx
// (o bundler escolhe o arquivo certo pela extensão, igual expo-audio faz).
export const AppAlert = {
  alert: Alert.alert,
};
