import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthStore } from '../store/authStore';
import { useNightsStore } from '../store/nightsStore';
import { createNight } from '../api/client';
import { analyzeNight, type MeteringSample } from '../audio/snoreDetector';

type Props = NativeStackScreenProps<RootStackParamList, 'SleepSession'>;

const RECORDING_OPTIONS = { ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true };

function formatElapsed(durationMillis: number) {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function SleepSessionScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const token = useAuthStore((s) => s.token);
  const fetchNights = useNightsStore((s) => s.fetchNights);
  const [saving, setSaving] = useState(false);

  const samplesRef = useRef<MeteringSample[]>([]);
  const startedAtRef = useRef<Date | null>(null);

  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 1000);

  useEffect(() => {
    if (recorderState.isRecording && typeof recorderState.metering === 'number') {
      samplesRef.current.push({ timestampMs: recorderState.durationMillis, dB: recorderState.metering });
    }
  }, [recorderState.durationMillis, recorderState.isRecording, recorderState.metering]);

  async function handleStart() {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o uso do microfone para gravar a noite.');
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      allowsBackgroundRecording: true,
      playsInSilentMode: true,
    });

    samplesRef.current = [];
    startedAtRef.current = new Date();
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function handleStop() {
    await recorder.stop();
    const startedAt = startedAtRef.current;
    if (!startedAt) return;

    const summary = analyzeNight(samplesRef.current, startedAt);

    if (!token) {
      Alert.alert('Sessão expirada', 'Faça login novamente.');
      return;
    }

    setSaving(true);
    try {
      await createNight(summary, token);
      await fetchNights(token);
      Alert.alert(
        'Noite salva',
        `${summary.eventsCount} eventos identificados, ${summary.snoreMinutes} min de ronco.`
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll={false} style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
      <SectionTitle>Gravação da noite</SectionTitle>

      <Card>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          {recorderState.isRecording
            ? 'Gravando... pode apagar a tela, a gravação continua em segundo plano.'
            : 'Deixe o celular perto da cama e inicie a gravação antes de dormir.'}
        </Text>
        {recorderState.isRecording && (
          <Text style={[typography.hero, { color: colors.primaryInk, textAlign: 'center' }]}>
            {formatElapsed(recorderState.durationMillis)}
          </Text>
        )}
        <Text style={[typography.caption, { color: colors.mutedInk }]}>
          A análise é feita só a partir do volume do áudio (heurística), não é diagnóstico médico.
        </Text>
      </Card>

      {recorderState.isRecording ? (
        <AppButton label="Parar e salvar" loading={saving} onPress={handleStop} />
      ) : (
        <AppButton label="Iniciar gravação da noite" onPress={handleStart} />
      )}
    </ScreenContainer>
  );
}
