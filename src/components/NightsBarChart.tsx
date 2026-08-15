import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import type { Night } from '../types/domain';

type Props = {
  nights: Night[];
  height?: number;
};

const BAR_RADIUS = 4;

function roundedTopBarPath(x: number, width: number, yTop: number, yBottom: number): string {
  const r = Math.min(BAR_RADIUS, (yBottom - yTop) / 2, width / 2);
  return [
    `M ${x} ${yBottom}`,
    `L ${x} ${yTop + r}`,
    `Q ${x} ${yTop} ${x + r} ${yTop}`,
    `L ${x + width - r} ${yTop}`,
    `Q ${x + width} ${yTop} ${x + width} ${yTop + r}`,
    `L ${x + width} ${yBottom}`,
    'Z',
  ].join(' ');
}

// Gráfico de barras simples: eventos respiratórios por noite (últimos dias).
// Uma única série -> sem legenda (o título já identifica o que é).
export function NightsBarChart({ nights, height = 160 }: Props) {
  const { colors, typography, spacing } = useTheme();
  const chartWidth = 320;
  const paddingTop = 24; // espaço para o rótulo do valor acima da barra
  const axisHeight = 18;
  const plotHeight = height - paddingTop - axisHeight;
  const gap = 10;
  const barWidth = (chartWidth - gap * (nights.length - 1)) / nights.length;
  const maxValue = Math.max(...nights.map((n) => n.eventsCount), 1);

  return (
    <View style={{ gap: spacing.xs }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
        <Line
          x1={0}
          y1={paddingTop + plotHeight}
          x2={chartWidth}
          y2={paddingTop + plotHeight}
          stroke={colors.baseline}
          strokeWidth={1}
        />
        {nights.map((night, index) => {
          const x = index * (barWidth + gap);
          const barHeight = (night.eventsCount / maxValue) * plotHeight;
          const yTop = paddingTop + plotHeight - barHeight;
          const yBottom = paddingTop + plotHeight;
          const isLast = index === nights.length - 1;
          return (
            <React.Fragment key={night.id}>
              <Path d={roundedTopBarPath(x, barWidth, yTop, yBottom)} fill={colors.brand} />
              {isLast ? (
                <SvgText
                  x={x + barWidth / 2}
                  y={Math.max(yTop - 8, 12)}
                  fontSize={12}
                  fontWeight="600"
                  fill={colors.primaryInk}
                  textAnchor="middle"
                >
                  {night.eventsCount}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>
      {/* Rótulos (valor + dia da semana) desenhados fora do SVG, mais simples de estilizar */}
      <View style={styles.labelsRow}>
        {nights.map((night) => (
          <View key={night.id} style={styles.labelCol}>
            <Text style={[typography.caption, { color: colors.mutedInk }]}>{night.weekdayLabel}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  labelCol: { alignItems: 'center', flex: 1 },
});
