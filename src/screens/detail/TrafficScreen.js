/**
 * ConversãoAI Mobile — TrafficScreen
 * NOVO ARQUIVO — diagnóstico de campanhas de tráfego pago
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { aiAPI } from "../../services/api";
import { COLORS, SPACING, RADIUS, FONTS } from "../../constants/theme";

const PLATFORMS = [
  {
    id: "Meta Ads",
    icon: "📘",
    label: "Meta Ads",
    desc: "Facebook / Instagram",
  },
  {
    id: "Google Ads",
    icon: "🔍",
    label: "Google Ads",
    desc: "Search / Display / YouTube",
  },
  {
    id: "TikTok Ads",
    icon: "🎵",
    label: "TikTok Ads",
    desc: "In-feed / TopView",
  },
];

function MetricInput({ label, value, onChangeText, placeholder, suffix = "" }) {
  return (
    <View style={s.metricWrap}>
      <Text style={s.metricLabel}>{label}</Text>
      <View style={s.metricInputWrap}>
        <TextInput
          style={s.metricInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text3}
          keyboardType="decimal-pad"
        />
        {suffix ? <Text style={s.metricSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function ResultItem({ icon, text, type }) {
  const bg =
    {
      neg: COLORS.redBg,
      sug: COLORS.blueBg,
      warn: COLORS.amberBg,
      purple: "rgba(108,79,255,0.1)",
    }[type] || COLORS.blueBg;
  const tc =
    { neg: "#ffaaaa", sug: "#a0c8ff", warn: "#ffe0a0", purple: "#c4b0ff" }[
      type
    ] || COLORS.text2;
  return (
    <View style={[s.resultItem, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 14, flexShrink: 0 }}>{icon}</Text>
      <Text style={[s.resultItemText, { color: tc }]}>{text}</Text>
    </View>
  );
}

export default function TrafficScreen() {
  const insets = useSafeAreaInsets();

  const [platform, setPlatform] = useState("Meta Ads");
  const [metrics, setMetrics] = useState({
    ctr: "",
    cpc: "",
    cpa: "",
    roas: "",
    cpm: "",
    conv: "",
  });
  const [product, setProduct] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function setMetric(key, val) {
    setMetrics((prev) => ({ ...prev, [key]: val }));
  }

  async function diagnose() {
    const filled = Object.values(metrics).some((v) => v.trim() !== "");
    if (!filled) {
      Alert.alert(
        "Métricas necessárias",
        "Preencha pelo menos uma métrica para diagnosticar.",
      );
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const metricsFormatted = {
        CTR: metrics.ctr ? `${metrics.ctr}%` : undefined,
        CPC: metrics.cpc ? `R$ ${metrics.cpc}` : undefined,
        "CPA/CPL": metrics.cpa ? `R$ ${metrics.cpa}` : undefined,
        ROAS: metrics.roas || undefined,
        CPM: metrics.cpm ? `R$ ${metrics.cpm}` : undefined,
        "Taxa de conversão": metrics.conv ? `${metrics.conv}%` : undefined,
      };
      // Remove campos vazios
      Object.keys(metricsFormatted).forEach((k) => {
        if (!metricsFormatted[k]) delete metricsFormatted[k];
      });

      const res = await aiAPI.analyzeTraffic({
        platform,
        metrics: metricsFormatted,
        product: product.trim(),
        context: context.trim(),
      });
      setResult(res.data.analysis);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert("Erro", err.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.score >= 8
      ? COLORS.green
      : result.score >= 6
        ? COLORS.amber
        : COLORS.red
    : COLORS.text;

  const healthBg = result
    ? result.saude === "boa"
      ? COLORS.greenBg
      : result.saude === "regular"
        ? COLORS.amberBg
        : COLORS.redBg
    : COLORS.surface2;

  const healthColor = result
    ? result.saude === "boa"
      ? COLORS.green
      : result.saude === "regular"
        ? COLORS.amber
        : COLORS.red
    : COLORS.text2;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Text style={s.title}>📈 Gestor de Tráfego IA</Text>
        <Text style={s.sub}>
          Preencha as métricas da sua campanha e receba diagnóstico cirúrgico
          com ações imediatas
        </Text>

        {/* Plataforma */}
        <Text style={s.fieldLabel}>Plataforma</Text>
        <View style={s.platformRow}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                s.platformCard,
                platform === p.id && s.platformCardActive,
              ]}
              onPress={() => setPlatform(p.id)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 22 }}>{p.icon}</Text>
              <Text
                style={[
                  s.platformLabel,
                  platform === p.id && s.platformLabelActive,
                ]}
              >
                {p.label}
              </Text>
              <Text style={s.platformDesc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Métricas */}
        <Text style={[s.fieldLabel, { marginTop: SPACING.md }]}>
          Métricas da campanha
        </Text>
        <View style={s.metricsGrid}>
          <MetricInput
            label="CTR"
            value={metrics.ctr}
            onChangeText={(v) => setMetric("ctr", v)}
            placeholder="Ex: 1.8"
            suffix="%"
          />
          <MetricInput
            label="CPC"
            value={metrics.cpc}
            onChangeText={(v) => setMetric("cpc", v)}
            placeholder="Ex: 0.85"
            suffix="R$"
          />
          <MetricInput
            label="CPA / CPL"
            value={metrics.cpa}
            onChangeText={(v) => setMetric("cpa", v)}
            placeholder="Ex: 45.00"
            suffix="R$"
          />
          <MetricInput
            label="ROAS"
            value={metrics.roas}
            onChangeText={(v) => setMetric("roas", v)}
            placeholder="Ex: 3.2"
            suffix="x"
          />
          <MetricInput
            label="CPM"
            value={metrics.cpm}
            onChangeText={(v) => setMetric("cpm", v)}
            placeholder="Ex: 18.00"
            suffix="R$"
          />
          <MetricInput
            label="Conversão"
            value={metrics.conv}
            onChangeText={(v) => setMetric("conv", v)}
            placeholder="Ex: 2.1"
            suffix="%"
          />
        </View>

        {/* Produto e contexto */}
        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Produto / nicho</Text>
            <TextInput
              style={s.input}
              value={product}
              onChangeText={setProduct}
              placeholder="Ex: Curso online de finanças"
              placeholderTextColor={COLORS.text3}
            />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Contexto extra (opcional)</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={context}
              onChangeText={setContext}
              placeholder="Descreva criativos em uso, segmentação, histórico…"
              placeholderTextColor={COLORS.text3}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={diagnose}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 16 }}>📊</Text>
                <Text style={s.btnText}>Diagnosticar Campanha</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result && (
          <View style={{ gap: SPACING.md }}>
            {/* Score + saúde */}
            <View style={s.scoreCard}>
              <View style={[s.scoreHeader, { backgroundColor: healthBg }]}>
                <View>
                  <Text style={[s.scoreNum, { color: scoreColor }]}>
                    {result.score}/10
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <View
                    style={[
                      s.healthBadge,
                      {
                        backgroundColor: healthBg,
                        borderColor: healthColor + "44",
                      },
                    ]}
                  >
                    <Text style={[s.healthText, { color: healthColor }]}>
                      Campanha {result.saude}
                    </Text>
                  </View>
                  {result.diagnostico && (
                    <Text style={s.diagText} numberOfLines={4}>
                      {result.diagnostico}
                    </Text>
                  )}
                </View>
              </View>

              {/* Benchmarks */}
              {(result.benchmark_ctr || result.benchmark_cpa) && (
                <View style={s.benchmarkRow}>
                  {result.benchmark_ctr && (
                    <View style={s.benchmarkCard}>
                      <Text style={s.benchmarkLabel}>CTR ideal</Text>
                      <Text style={[s.benchmarkVal, { color: COLORS.accent2 }]}>
                        {result.benchmark_ctr}
                      </Text>
                    </View>
                  )}
                  {result.benchmark_cpa && (
                    <View style={s.benchmarkCard}>
                      <Text style={s.benchmarkLabel}>CPA ideal</Text>
                      <Text style={[s.benchmarkVal, { color: COLORS.green }]}>
                        {result.benchmark_cpa}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Problemas críticos */}
            {result.problemas_criticos?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.red }]}>
                  🚨 Problemas críticos
                </Text>
                {result.problemas_criticos.map((item, i) => (
                  <ResultItem key={i} icon="❌" text={item} type="neg" />
                ))}
              </View>
            )}

            {/* Ações imediatas */}
            {result.acoes_imediatas?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.amber }]}>
                  ⚡ Ações imediatas
                </Text>
                {result.acoes_imediatas.map((item, i) => (
                  <ResultItem key={i} icon="⚡" text={item} type="warn" />
                ))}
              </View>
            )}

            {/* Médio prazo */}
            {result.acoes_medio_prazo?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.blue }]}>
                  📅 Médio prazo
                </Text>
                {result.acoes_medio_prazo.map((item, i) => (
                  <ResultItem key={i} icon="📅" text={item} type="sug" />
                ))}
              </View>
            )}

            {/* Testes sugeridos */}
            {result.testes_sugeridos?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.accent2 }]}>
                  ⚖️ Testes sugeridos
                </Text>
                {result.testes_sugeridos.map((item, i) => (
                  <ResultItem key={i} icon="🧪" text={item} type="purple" />
                ))}
              </View>
            )}

            {/* Projeção */}
            {result.projecao && (
              <View style={s.projecaoCard}>
                <Text style={s.projecaoTitle}>📈 Projeção</Text>
                <Text style={s.projecaoText}>{result.projecao}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: COLORS.text2,
    marginBottom: SPACING.xl,
    lineHeight: 19,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  platformRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  platformCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 3,
  },
  platformCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "18",
  },
  platformLabel: {
    fontSize: 11.5,
    fontFamily: FONTS.medium,
    color: COLORS.text2,
  },
  platformLabelActive: { color: COLORS.accent2 },
  platformDesc: { fontSize: 9, color: COLORS.text3, textAlign: "center" },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricWrap: { width: "48%", gap: 5 },
  metricLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.text2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metricInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border2,
    paddingHorizontal: 10,
    height: 40,
  },
  metricInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.body,
  },
  metricSuffix: { fontSize: 11, color: COLORS.text3, marginLeft: 4 },
  form: { gap: SPACING.md, marginBottom: SPACING.lg },
  field: { gap: 6 },
  input: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border2,
    color: COLORS.text,
    fontSize: 13.5,
    paddingHorizontal: 13,
    height: 46,
    fontFamily: FONTS.body,
  },
  textarea: { height: 80, paddingTop: 11, textAlignVertical: "top" },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 15, fontFamily: FONTS.heading, color: "#fff" },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scoreNum: { fontSize: 38, fontFamily: FONTS.heading, lineHeight: 42 },
  healthBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 6,
  },
  healthText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: "capitalize",
  },
  diagText: { fontSize: 12.5, color: COLORS.text2, lineHeight: 18 },
  benchmarkRow: { flexDirection: "row", gap: SPACING.sm, padding: SPACING.sm },
  benchmarkCard: {
    flex: 1,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: "center",
  },
  benchmarkLabel: { fontSize: 9.5, color: COLORS.text3, marginBottom: 3 },
  benchmarkVal: { fontSize: 14, fontFamily: FONTS.heading },
  section: { gap: 5 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  resultItem: {
    flexDirection: "row",
    gap: 8,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: "flex-start",
  },
  resultItemText: { fontSize: 12.5, flex: 1, lineHeight: 18 },
  projecaoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.green + "44",
  },
  projecaoTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.green,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  projecaoText: { fontSize: 13.5, color: COLORS.text, lineHeight: 20 },
});
