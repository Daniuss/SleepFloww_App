// Android/iOS: o Alert.alert nativo já mostra sua própria UI do sistema
// operacional, então não há nada pra este componente renderizar aqui.
// A versão real fica em AppAlertHost.web.tsx.
export function AppAlertHost(): null {
  return null;
}
