import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'O que é gravado',
    body:
      'Durante a gravação da noite, o app captura o nível de volume do microfone do ' +
      'celular em intervalos de ~1 segundo. O áudio bruto fica só no dispositivo durante a ' +
      'gravação e é apagado assim que a análise termina — ele nunca é enviado nem armazenado ' +
      'em nenhum servidor.',
  },
  {
    title: 'O que é enviado ao servidor',
    body:
      'Apenas o resumo calculado da noite (data, número de eventos identificados, minutos de ' +
      'ronco, duração do sono e severidade) e os registros manuais que você preenche (sintomas, ' +
      'hábitos, uso de CPAP, observações) são enviados ao backend do app.',
  },
  {
    title: 'Onde os dados ficam',
    body:
      'O backend deste app roda localmente, na sua própria rede — não há serviço de terceiros ' +
      'envolvido, nem compartilhamento de dados com anunciantes ou outras empresas.',
  },
  {
    title: 'Diagnóstico médico',
    body:
      'Os dados e indícios mostrados no app vêm de uma heurística simples baseada em volume ' +
      'de áudio. Isso não é um diagnóstico médico nem substitui avaliação de um profissional ' +
      'de saúde.',
  },
];

export function PrivacyPolicyScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <ScreenContainer>
      <SectionTitle>Política de privacidade</SectionTitle>
      <Text style={[typography.caption, { color: colors.mutedInk }]}>
        Este texto é informativo, descrevendo como este app funciona hoje — não é um documento
        jurídico revisado por um advogado.
      </Text>

      {SECTIONS.map((section) => (
        <Card key={section.title} style={{ gap: spacing.xs }}>
          <Text style={[typography.subtitle, { color: colors.primaryInk }]}>{section.title}</Text>
          <Text style={[typography.body, { color: colors.secondaryInk }]}>{section.body}</Text>
        </Card>
      ))}

      <View style={{ paddingTop: spacing.sm }}>
        <Text
          style={[typography.body, { color: colors.brand, textAlign: 'center' }]}
          onPress={() => navigation.goBack()}
        >
          Voltar
        </Text>
      </View>
    </ScreenContainer>
  );
}
