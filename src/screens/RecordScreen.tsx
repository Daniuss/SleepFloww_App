import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { FormField } from '../components/FormField';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';
import { useRecordStore } from '../store/recordStore';
import { useAuthStore } from '../store/authStore';
import { useRecordsStore } from '../store/recordsStore';
import { submitRecord } from '../api/supabaseData';
import { PARTNER_OBSERVATIONS, SLEEP_POSITIONS, SYMPTOMS } from '../data/recordLabels';

const SECTIONS = ['Sintomas', 'Parceiro(a)', 'Hábitos', 'CPAP'] as const;
type Section = (typeof SECTIONS)[number];

export function RecordScreen() {
  const { colors, spacing, typography } = useTheme();
  const [section, setSection] = useState<Section>('Sintomas');
  const {
    draft,
    toggleSymptom,
    togglePartnerObservation,
    setHabit,
    setSleepPosition,
    setUsedCpap,
    setCpapDurationHours,
    setNotes,
    reset,
  } = useRecordStore();
  const userId = useAuthStore((s) => s.user?.id);
  const fetchRecords = useRecordsStore((s) => s.fetchRecords);
  const [saving, setSaving] = useState(false);

  return (
    <ScreenContainer>
      <SectionTitle>Registro manual</SectionTitle>
      <Text style={[typography.body, { color: colors.secondaryInk }]}>
        Esses dados ficam salvos na sua conta e continuam disponíveis da próxima vez que você entrar.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {SECTIONS.map((s) => (
          <Chip key={s} label={s} selected={section === s} onPress={() => setSection(s)} />
        ))}
      </View>

      {section === 'Sintomas' && (
        <Card>
          <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Como você acordou?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {SYMPTOMS.map((s) => (
              <Chip
                key={s.key}
                label={s.label}
                selected={draft.symptoms.includes(s.key)}
                onPress={() => toggleSymptom(s.key)}
              />
            ))}
          </View>
        </Card>
      )}

      {section === 'Parceiro(a)' && (
        <Card>
          <Text style={[typography.subtitle, { color: colors.primaryInk }]}>
            O que seu(sua) parceiro(a) observou?
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {PARTNER_OBSERVATIONS.map((o) => (
              <Chip
                key={o.key}
                label={o.label}
                selected={draft.partnerObservations.includes(o.key)}
                onPress={() => togglePartnerObservation(o.key)}
              />
            ))}
          </View>
        </Card>
      )}

      {section === 'Hábitos' && (
        <Card>
          <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Hábitos de ontem à noite</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Chip label="Consumiu álcool" selected={draft.usedAlcohol} onPress={() => setHabit('usedAlcohol', !draft.usedAlcohol)} />
            <Chip label="Consumiu cafeína" selected={draft.usedCaffeine} onPress={() => setHabit('usedCaffeine', !draft.usedCaffeine)} />
            <Chip label="Tomou medicamento" selected={draft.tookMedication} onPress={() => setHabit('tookMedication', !draft.tookMedication)} />
          </View>
          <Text style={[typography.subtitle, { color: colors.primaryInk, marginTop: spacing.sm }]}>
            Posição para dormir
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {SLEEP_POSITIONS.map((p) => (
              <Chip
                key={p.key}
                label={p.label}
                selected={draft.sleepPosition === p.key}
                onPress={() => setSleepPosition(p.key)}
              />
            ))}
          </View>
        </Card>
      )}

      {section === 'CPAP' && (
        <Card>
          <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Uso de CPAP</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip label="Usei CPAP" selected={draft.usedCpap} onPress={() => setUsedCpap(!draft.usedCpap)} />
          </View>
          {draft.usedCpap && (
            <FormField
              label="Tempo aproximado de uso (horas)"
              placeholder="Ex: 6"
              keyboardType="numeric"
              value={draft.cpapDurationHours}
              onChangeText={setCpapDurationHours}
            />
          )}
        </Card>
      )}

      <Card>
        <FormField
          label="Observações gerais"
          placeholder="Algo mais que queira registrar?"
          multiline
          value={draft.notes}
          onChangeText={setNotes}
          style={{ height: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
        />
      </Card>

      <AppButton
        label="Salvar registro"
        loading={saving}
        onPress={async () => {
          if (!userId) {
            Alert.alert('Sessão expirada', 'Faça login novamente.');
            return;
          }
          setSaving(true);
          try {
            await submitRecord(draft, userId);
            await fetchRecords(userId);
            Alert.alert('Registro salvo', 'Seus dados foram enviados para o servidor.');
            reset();
          } catch (err) {
            Alert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
          } finally {
            setSaving(false);
          }
        }}
      />
    </ScreenContainer>
  );
}
