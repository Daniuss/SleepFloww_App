// Versão Web: react-native-web implementa Alert.alert como um no-op
// (não faz nada, ver node_modules/react-native-web/src/exports/Alert).
// Aqui guardamos o pedido de alerta e um AppAlertHost (montado 1x no
// App.tsx) escuta e renderiza um Modal de verdade, usando os tokens do
// design system existente.
export type AppAlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AppAlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons: AppAlertButton[];
};

type Listener = (request: AppAlertRequest) => void;

let listener: Listener | null = null;
let nextId = 0;

export function setAlertListener(l: Listener | null) {
  listener = l;
}

function alert(title: string, message?: string, buttons?: AppAlertButton[]) {
  const request: AppAlertRequest = {
    id: nextId++,
    title,
    message,
    buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
  };
  listener?.(request);
}

export const AppAlert = { alert };
