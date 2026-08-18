import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text } from 'react-native';
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
import { createNight } from '../api/supabaseData';
import { analyzeNight, type MeteringSample } from '../audio/snoreDetector';
import { WebAudioMeter } from '../audio/webMetering';
import { AppAlert } from '../components/AppAlert';

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
  const userId = useAuthStore((s) => s.user?.id);
  const fetchNights = useNightsStore((s) => s.fetchNights);
  const [saving, setSaving] = useState(false);

  const samplesRef = useRef<MeteringSample[]>([]);
  const startedAtRef = useRef<Date | null>(null);
  const webMeterRef = useRef<WebAudioMeter | null>(null);

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
      AppAlert.alert('Permissão necessária', 'Autorize o uso do microfone para gravar a noite.');
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

    // expo-audio não mede nível de áudio na Web (RecorderState.metering
    // nunca vem preenchido lá) — só no Android/iOS. Na Web, medimos o volume
    // por conta própria via Web Audio API, em paralelo à gravação.
    if (Platform.OS === 'web') {
      const meter = new WebAudioMeter();
      webMeterRef.current = meter;
      try {
        await meter.start((sample) => samplesRef.current.push(sample));
      } catch {
        // Sem o segundo acesso ao microfone a heurística fica sem dados,
        // mas a gravação em si (expo-audio) já está rodando normalmente.
        webMeterRef.current = null;
      }
    }
  }

  async function handleStop() {
    try {
      await recorder.stop();
    } catch (err) {
      AppAlert.alert(
        'Erro ao parar a gravação',
        err instanceof Error ? err.message : 'Não foi possível finalizar a gravação. Tente novamente.'
      );
      return;
    } finally {
      webMeterRef.current?.stop();
      webMeterRef.current = null;
    }

    const startedAt = startedAtRef.current;
    if (!startedAt) return;

    const summary = analyzeNight(samplesRef.current, startedAt);

    if (!userId) {
      AppAlert.alert('Sessão expirada', 'Faça login novamente.');
      return;
    }

    setSaving(true);
    try {
      await createNight(summary, userId);
      await fetchNights(userId);
      AppAlert.alert(
        'Noite salva',
        `${summary.eventsCount} eventos identificados, ${summary.snoreMinutes} min de ronco.`
      );
      navigation.goBack();
    } catch (err) {
      AppAlert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
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
            ? Platform.OS === 'web'
              ? 'Gravando... mantenha esta aba aberta e em primeiro plano. No navegador, trocar de aba ou bloquear a tela interrompe a gravação.'
              : 'Gravando... pode apagar a tela, a gravação continua em segundo plano.'
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
