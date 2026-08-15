import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionSubtitle, SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { StatTile } from '../components/StatTile';
import { StatusBadge } from '../components/StatusBadge';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';
import { severityLabel } from '../data/mockNights';
import { useNightsStore } from '../store/nightsStore';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { nights, loading, error } = useNightsStore();

  if (loading) {
    return (
      <ScreenContainer>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          {error ? error : 'Carregando dados da noite...'}
        </Text>
      </ScreenContainer>
    );
  }

  if (nights.length === 0) {
    return (
      <ScreenContainer>
        <SectionTitle>Resumo da noite</SectionTitle>
        <Card>
          <Text style={[typography.body, { color: colors.secondaryInk }]}>
            {error ?? 'Nenhuma noite gravada ainda.'}
          </Text>
          <AppButton
            label="Iniciar gravação da noite"
            onPress={() => navigation.navigate('SleepSession')}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const lastNight = nights[nights.length - 1];
  const previousNight = nights.length > 1 ? nights[nights.length - 2] : lastNight;
  const eventsDelta = lastNight.eventsCount - previousNight.eventsCount;

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>Bom dia</Text>
        <SectionTitle>Resumo da noite</SectionTitle>
      </View>

      <Card>
        <StatusBadge severity={lastNight.severity} label={severityLabel(lastNight.severity)} />
        <SectionSubtitle>
          {lastNight.eventsCount} eventos identificados durante a noite
          {eventsDelta !== 0
            ? ` (${eventsDelta > 0 ? '+' : ''}${eventsDelta} em relação à noite anterior)`
            : ' (igual à noite anterior)'}
          .
        </SectionSubtitle>
        <Text style={[typography.caption, { color: colors.mutedInk }]}>
          Indícios e padrões identificados pelo app — não é diagnóstico médico.
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatTile label="Duração do sono" value={`${lastNight.sleepDurationHours.toFixed(1)}h`} />
        <StatTile label="Minutos de ronco" value={`${lastNight.snoreMinutes} min`} />
      </View>

      <AppButton
        label="Iniciar gravação da noite"
        variant="secondary"
        onPress={() => navigation.navigate('SleepSession')}
      />

      <Card>
        <SectionSubtitle>Registro manual de hoje</SectionSubtitle>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          Conte como você se sentiu ao acordar e se usou CPAP — isso ajuda a entender melhor os
          padrões identificados.
        </Text>
        <AppButton label="Preencher registro" onPress={() => navigation.navigate('Registro')} />
      </Card>
    </ScreenContainer>
  );
}
