/**
 * ConversãoAI Mobile — AnalysisScreen
 * NOVO ARQUIVO — exibe detalhe de uma análise salva no histórico
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRoute, useNavigation } from "@react-navigation/native";
import { analysisAPI } from "../../services/api";
import { COLORS, SPACING, RADIUS, FONTS } from "../../constants/theme";

const TYPE_LABELS = {
  CREATIVE: "🎨 Criativo",
  LANDING_PAGE: "📄 Página de Vendas",
  COPY_GENERATION: "✍️ Copy",
  CAMPAIGN: "🚀 Campanha",
  IDEA_VALIDATION: "💡 Validação de Ideia",
  TRAFFIC: "📈 Tráfego",
  AB_TEST: "⚖️ Teste A/B",
};

function ScoreBar({ label, value, color }) {
  return (
    <View style={s.scoreRow}>
      <Text style={s.scoreLabel}>{label}</Text>
      <View style={s.barBg}>
        <View
          style={[
            s.barFill,
            { width: `${(value || 0) * 10}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[s.scoreVal, { color }]}>{value ?? "—"}</Text>
    </View>
  );
}

function Section({ title, color, items, type }) {
  if (!items || items.length === 0) return null;
  const bg =
    { pos: COLORS.greenBg, neg: COLORS.redBg, sug: COLORS.blueBg }[type] ||
    COLORS.blueBg;
  const tc =
    { pos: "#7dfab5", neg: "#ffaaaa", sug: "#a0c8ff" }[type] || COLORS.text2;
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color }]}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={[s.item, { backgroundColor: bg }]}>
          <Text style={[s.itemText, { color: tc }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalysisScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const analysisId = route.params?.id;

  const [data, setData] = useState(route.params?.analysis || null);
  const [loading, setLoading] = useState(!route.params?.analysis);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!data && analysisId) {
      analysisAPI
        .getById(analysisId)
        .then((r) => setData(r.data?.data))
        .catch(() =>
          Alert.alert("Erro", "Não foi possível carregar a análise."),
        )
        .finally(() => setLoading(false));
    }
  }, [analysisId]);

  async function copy(text, key) {
    await Clipboard.setStringAsync(String(text));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.accent2} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.center}>
        <Text style={{ color: COLORS.text2 }}>Análise não encontrada.</Text>
      </View>
    );
  }

  const result = data.result || data;
  const score = data.score ?? result.nota_geral ?? result.nota_viabilidade;
  const scoreColor =
    score >= 8 ? COLORS.green : score >= 6 ? COLORS.amber : COLORS.red;
  const typeLabel = TYPE_LABELS[data.type] || data.type || "Análise";

  return (
    <View style={[s.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.typeLabel}>{typeLabel}</Text>
            {data.product ? (
              <Text style={s.product}>{data.product}</Text>
            ) : null}
          </View>
          {score != null && (
            <View style={s.scoreBadge}>
              <Text style={[s.scoreNum, { color: scoreColor }]}>
                {Number(score).toFixed(1)}
              </Text>
              <Text style={s.scoreDenom}>/10</Text>
            </View>
          )}
        </View>

        {/* Score bars quando disponíveis */}
        {(result.nota_conversao != null || result.nota_clareza != null) && (
          <View style={s.scoreCard}>
            {result.nota_conversao != null && (
              <ScoreBar
                label="Conversão"
                value={result.nota_conversao}
                color={COLORS.green}
              />
            )}
            {result.nota_clareza != null && (
              <ScoreBar
                label="Clareza"
                value={result.nota_clareza}
                color={COLORS.accent2}
              />
            )}
            {result.nota_persuasao != null && (
              <ScoreBar
                label="Persuasão"
                value={result.nota_persuasao}
                color={COLORS.amber}
              />
            )}
            {result.nota_hook != null && (
              <ScoreBar
                label="Hook"
                value={result.nota_hook}
                color={COLORS.pink}
              />
            )}
          </View>
        )}

        {/* Resumo */}
        {result.resumo && (
          <View style={s.resumeCard}>
            <Text style={s.resumeText}>{result.resumo}</Text>
          </View>
        )}

        {/* Pontos */}
        <Section
          title="✅ Pontos fortes"
          color={COLORS.green}
          items={result.pontos_fortes}
          type="pos"
        />
        <Section
          title="❌ Pontos fracos"
          color={COLORS.red}
          items={result.pontos_fracos}
          type="neg"
        />
        <Section
          title="⚠️ Erros críticos"
          color={COLORS.red}
          items={result.erros_criticos}
          type="neg"
        />
        <Section
          title="💡 Sugestões"
          color={COLORS.blue}
          items={result.sugestoes}
          type="sug"
        />
        <Section
          title="💡 Melhorias"
          color={COLORS.blue}
          items={result.melhorias}
          type="sug"
        />
        <Section
          title="⚡ Ações imediatas"
          color={COLORS.amber}
          items={result.acoes_imediatas}
          type="sug"
        />

        {/* Headline sugerida */}
        {result.headline_sugerida && (
          <View style={s.highlightCard}>
            <View style={s.highlightHeader}>
              <Text style={s.highlightTitle}>🔥 Headline sugerida</Text>
              <TouchableOpacity
                onPress={() => copy(result.headline_sugerida, "hl")}
              >
                <Ionicons
                  name={copied === "hl" ? "checkmark" : "copy-outline"}
                  size={17}
                  color={copied === "hl" ? COLORS.green : COLORS.text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={s.highlightText} selectable>
              "{result.headline_sugerida}"
            </Text>
          </View>
        )}

        {/* CTA sugerido */}
        {result.cta_sugerido && (
          <View style={[s.highlightCard, { borderColor: COLORS.green + "44" }]}>
            <View style={s.highlightHeader}>
              <Text style={[s.highlightTitle, { color: COLORS.green }]}>
                🎯 CTA sugerido
              </Text>
              <TouchableOpacity
                onPress={() => copy(result.cta_sugerido, "cta")}
              >
                <Ionicons
                  name={copied === "cta" ? "checkmark" : "copy-outline"}
                  size={17}
                  color={copied === "cta" ? COLORS.green : COLORS.text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={s.highlightText} selectable>
              "{result.cta_sugerido}"
            </Text>
          </View>
        )}

        {/* Versão otimizada */}
        {result.versao_otimizada && (
          <View style={s.bigCard}>
            <View style={s.bigCardHeader}>
              <Text style={s.bigCardTitle}>🔥 Versão otimizada</Text>
              <TouchableOpacity
                onPress={() => copy(result.versao_otimizada, "opt")}
              >
                <Ionicons
                  name={copied === "opt" ? "checkmark" : "copy-outline"}
                  size={17}
                  color={copied === "opt" ? COLORS.green : COLORS.text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={s.bigCardText} selectable>
              {result.versao_otimizada}
            </Text>
          </View>
        )}

        {/* Promessa principal (validação de ideia) */}
        {result.promessa_principal && (
          <View style={s.bigCard}>
            <View style={s.bigCardHeader}>
              <Text style={s.bigCardTitle}>🔥 Promessa principal</Text>
              <TouchableOpacity
                onPress={() => copy(result.promessa_principal, "prom")}
              >
                <Ionicons
                  name={copied === "prom" ? "checkmark" : "copy-outline"}
                  size={17}
                  color={copied === "prom" ? COLORS.green : COLORS.text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={s.bigCardText} selectable>
              "{result.promessa_principal}"
            </Text>
          </View>
        )}

        {/* Conteúdo genérico (campanha, copy, etc.) */}
        {result.content && (
          <View style={s.bigCard}>
            <View style={s.bigCardHeader}>
              <Text style={s.bigCardTitle}>📄 Resultado</Text>
              <TouchableOpacity onPress={() => copy(result.content, "cnt")}>
                <Ionicons
                  name={copied === "cnt" ? "checkmark" : "copy-outline"}
                  size={17}
                  color={copied === "cnt" ? COLORS.green : COLORS.text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={s.bigCardText} selectable>
              {result.content}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  headerLeft: { flex: 1 },
  typeLabel: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 4,
  },
  product: { fontSize: 13, color: COLORS.text2 },
  scoreBadge: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  scoreNum: { fontSize: 36, fontFamily: FONTS.heading, lineHeight: 40 },
  scoreDenom: { fontSize: 14, color: COLORS.text2 },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 9,
    marginBottom: SPACING.md,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  scoreLabel: { fontSize: 11, color: COLORS.text2, width: 72 },
  barBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surface2,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },
  scoreVal: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    width: 22,
    textAlign: "right",
  },
  resumeCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resumeText: { fontSize: 13.5, color: COLORS.text2, lineHeight: 20 },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  item: { padding: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: 4 },
  itemText: { fontSize: 13, lineHeight: 18 },
  highlightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent + "44",
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  highlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  highlightTitle: {
    fontSize: 13,
    fontFamily: FONTS.heading,
    color: COLORS.accent2,
  },
  highlightText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    padding: SPACING.md,
    lineHeight: 22,
  },
  bigCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  bigCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  bigCardTitle: {
    fontSize: 13.5,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  bigCardText: {
    fontSize: 13.5,
    color: COLORS.text,
    lineHeight: 22,
    padding: SPACING.md,
  },
});
