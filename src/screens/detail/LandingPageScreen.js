/**
 * ConversãoAI Mobile — LandingPageScreen
 * NOVO ARQUIVO — análise de página de vendas
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
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { aiAPI } from "../../services/api";
import { COLORS, SPACING, RADIUS, FONTS } from "../../constants/theme";

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

function ResultItem({ icon, text, type }) {
  const bg =
    {
      pos: COLORS.greenBg,
      neg: COLORS.redBg,
      sug: COLORS.blueBg,
      warn: COLORS.amberBg,
    }[type] || COLORS.blueBg;
  const tc =
    { pos: "#7dfab5", neg: "#ffaaaa", sug: "#a0c8ff", warn: "#ffe0a0" }[type] ||
    COLORS.text2;
  return (
    <View style={[s.resultItem, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 14, flexShrink: 0 }}>{icon}</Text>
      <Text style={[s.resultItemText, { color: tc }]}>{text}</Text>
    </View>
  );
}

export default function LandingPageScreen() {
  const insets = useSafeAreaInsets();

  const [pageText, setPageText] = useState("");
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");

  async function analyze() {
    if (pageText.trim().length < 50) {
      Alert.alert(
        "Conteúdo insuficiente",
        "Cole pelo menos 50 caracteres da sua página para analisar.",
      );
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.analyzePage({
        text: pageText.trim(),
        product: product.trim(),
        audience: audience.trim(),
        price: price.trim(),
      });
      setResult(res.data.analysis);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert("Erro", err.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text, key) {
    await Clipboard.setStringAsync(String(text));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  const scoreColor = result
    ? result.nota_geral >= 8
      ? COLORS.green
      : result.nota_geral >= 6
        ? COLORS.amber
        : COLORS.red
    : COLORS.text;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Text style={s.title}>📄 Analisador de Página</Text>
        <Text style={s.sub}>
          Cole o texto da sua página de vendas e receba diagnóstico completo com
          melhorias práticas
        </Text>

        {/* Formulário */}
        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Texto da página *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={pageText}
              onChangeText={setPageText}
              placeholder="Cole aqui o texto completo: headline, subtítulo, benefícios, depoimentos, CTA…"
              placeholderTextColor={COLORS.text3}
              multiline
              maxLength={8000}
            />
            <Text style={s.charCount}>{pageText.length}/8000</Text>
          </View>

          <View style={s.twoCol}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldLabel}>Produto</Text>
              <TextInput
                style={s.input}
                value={product}
                onChangeText={setProduct}
                placeholder="Ex: Mentoria de copy"
                placeholderTextColor={COLORS.text3}
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldLabel}>Preço</Text>
              <TextInput
                style={s.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Ex: R$ 997"
                placeholderTextColor={COLORS.text3}
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Público-alvo</Text>
            <TextInput
              style={s.input}
              value={audience}
              onChangeText={setAudience}
              placeholder="Ex: Empreendedores iniciantes 25-45 anos"
              placeholderTextColor={COLORS.text3}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={analyze}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 16 }}>🔍</Text>
                <Text style={s.btnText}>Analisar Página</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result && (
          <View style={{ gap: SPACING.md }}>
            {/* Score geral */}
            <View style={s.scoreCard}>
              <View style={s.scoreHeader}>
                <View>
                  <Text style={[s.scoreNum, { color: scoreColor }]}>
                    {result.nota_geral}
                  </Text>
                  <Text style={s.scoreDenom}>/10 · score da página</Text>
                </View>
                {result.resumo ? (
                  <Text style={s.resumo} numberOfLines={3}>
                    {result.resumo}
                  </Text>
                ) : null}
              </View>
              <View style={s.scoreBars}>
                <ScoreBar
                  label="Headline"
                  value={result.nota_headline}
                  color={COLORS.accent2}
                />
                <ScoreBar
                  label="Oferta"
                  value={result.nota_oferta}
                  color={COLORS.green}
                />
                <ScoreBar
                  label="CTA"
                  value={result.nota_cta}
                  color={COLORS.amber}
                />
                <ScoreBar
                  label="Prova social"
                  value={result.nota_prova_social}
                  color={COLORS.blue}
                />
                <ScoreBar
                  label="Persuasão"
                  value={result.nota_persuasao}
                  color={COLORS.pink}
                />
              </View>
            </View>

            {/* Erros críticos */}
            {result.erros_criticos?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.red }]}>
                  ⚠️ Erros críticos
                </Text>
                {result.erros_criticos.map((item, i) => (
                  <ResultItem key={i} icon="❌" text={item} type="neg" />
                ))}
              </View>
            )}

            {/* Pontos fortes */}
            {result.pontos_fortes?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.green }]}>
                  ✅ Pontos fortes
                </Text>
                {result.pontos_fortes.map((item, i) => (
                  <ResultItem key={i} icon="✅" text={item} type="pos" />
                ))}
              </View>
            )}

            {/* Melhorias */}
            {result.melhorias?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.blue }]}>
                  💡 Melhorias
                </Text>
                {result.melhorias.map((item, i) => (
                  <ResultItem key={i} icon="💡" text={item} type="sug" />
                ))}
              </View>
            )}

            {/* Headline sugerida */}
            {result.headline_sugerida && (
              <View style={s.highlightCard}>
                <View style={s.highlightHeader}>
                  <Text style={s.highlightTitle}>🔥 Headline sugerida</Text>
                  <TouchableOpacity
                    onPress={() => copyText(result.headline_sugerida, "hl")}
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
              <View
                style={[s.highlightCard, { borderColor: COLORS.green + "55" }]}
              >
                <View style={s.highlightHeader}>
                  <Text style={[s.highlightTitle, { color: COLORS.green }]}>
                    🎯 CTA sugerido
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyText(result.cta_sugerido, "cta")}
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

            {/* Estrutura sugerida */}
            {result.estrutura_sugerida && (
              <View style={s.bigCard}>
                <View style={s.bigCardHeader}>
                  <Text style={s.bigCardTitle}>📐 Estrutura recomendada</Text>
                  <TouchableOpacity
                    onPress={() => copyText(result.estrutura_sugerida, "est")}
                  >
                    <Ionicons
                      name={copied === "est" ? "checkmark" : "copy-outline"}
                      size={17}
                      color={copied === "est" ? COLORS.green : COLORS.text2}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={s.bigCardText} selectable>
                  {result.estrutura_sugerida}
                </Text>
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
  form: { gap: SPACING.md, marginBottom: SPACING.lg },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
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
  textarea: {
    height: 160,
    paddingTop: 11,
    textAlignVertical: "top",
    marginBottom: 2,
  },
  charCount: { fontSize: 10, color: COLORS.text3, textAlign: "right" },
  twoCol: { flexDirection: "row", gap: SPACING.md },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: SPACING.sm,
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
    alignItems: "flex-start",
    gap: SPACING.md,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  scoreNum: { fontSize: 46, fontFamily: FONTS.heading, lineHeight: 50 },
  scoreDenom: { fontSize: 11, color: COLORS.text2, marginTop: 2 },
  resumo: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.text2,
    lineHeight: 18,
    marginTop: 4,
  },
  scoreBars: { padding: SPACING.md, gap: 9 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  scoreLabel: { fontSize: 11, color: COLORS.text2, width: 84 },
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
  highlightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent + "44",
    overflow: "hidden",
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
