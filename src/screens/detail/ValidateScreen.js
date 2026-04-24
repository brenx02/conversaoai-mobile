/**
 * ConversãoAI Mobile — ValidateScreen
 * NOVO ARQUIVO — validador de ideias de produto
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

const MODELS = [
  "Infoproduto (curso, ebook)",
  "Mentoria / consultoria",
  "SaaS / software",
  "E-commerce / produto físico",
  "Serviço local",
  "Afiliado",
];

const EXPERIENCES = [
  "Iniciante (0-1 ano)",
  "Intermediário (1-3 anos)",
  "Avançado (3+ anos)",
];

function TagChip({ label, color }) {
  return (
    <View
      style={[
        tc.chip,
        {
          backgroundColor: (color || COLORS.accent) + "20",
          borderColor: (color || COLORS.accent) + "44",
        },
      ]}
    >
      <Text style={[tc.chipText, { color: color || COLORS.accent2 }]}>
        {label}
      </Text>
    </View>
  );
}

const tc = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 11, fontFamily: FONTS.medium },
});

function ResultItem({ icon, text, type }) {
  const bg =
    {
      pos: COLORS.greenBg,
      neg: COLORS.redBg,
      sug: COLORS.blueBg,
      warn: COLORS.amberBg,
    }[type] || COLORS.blueBg;
  const color =
    { pos: "#7dfab5", neg: "#ffaaaa", sug: "#a0c8ff", warn: "#ffe0a0" }[type] ||
    COLORS.text2;
  return (
    <View style={[s.listItem, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 13, flexShrink: 0 }}>{icon}</Text>
      <Text style={[s.listItemText, { color }]}>{text}</Text>
    </View>
  );
}

export default function ValidateScreen() {
  const insets = useSafeAreaInsets();

  const [idea, setIdea] = useState("");
  const [niche, setNiche] = useState("");
  const [modelIdx, setModelIdx] = useState(0);
  const [expIdx, setExpIdx] = useState(0);
  const [invest, setInvest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedProm, setCopiedProm] = useState(false);

  async function validate() {
    if (idea.trim().length < 20) {
      Alert.alert(
        "Descreva melhor",
        "Escreva pelo menos 20 caracteres descrevendo sua ideia.",
      );
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.validateIdea({
        idea: idea.trim(),
        niche: niche.trim(),
        model: MODELS[modelIdx],
        invest: invest.trim(),
        experience: EXPERIENCES[expIdx],
      });
      setResult(res.data.analysis);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert("Erro", err.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPromise() {
    if (!result?.promessa_principal) return;
    await Clipboard.setStringAsync(result.promessa_principal);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedProm(true);
    setTimeout(() => setCopiedProm(false), 2000);
  }

  const potColor = result
    ? result.potencial === "alto"
      ? COLORS.green
      : result.potencial === "médio"
        ? COLORS.amber
        : COLORS.red
    : COLORS.text;

  const potBg = result
    ? result.potencial === "alto"
      ? COLORS.greenBg
      : result.potencial === "médio"
        ? COLORS.amberBg
        : COLORS.redBg
    : COLORS.surface2;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Text style={s.title}>💡 Validador de Ideias</Text>
        <Text style={s.sub}>
          Descreva sua ideia e a IA avalia o potencial, público, posicionamento
          e cria a promessa principal
        </Text>

        {/* Formulário */}
        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Descreva sua ideia *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={idea}
              onChangeText={setIdea}
              placeholder="Seja específico. Ex: Quero criar um curso de dropshipping para iniciantes de 20-35 anos que nunca venderam online, focado em encontrar produtos de alta margem…"
              placeholderTextColor={COLORS.text3}
              multiline
              maxLength={2000}
            />
            <Text style={s.charCount}>{idea.length}/2000</Text>
          </View>

          <View style={s.twoCol}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldLabel}>Nicho / mercado</Text>
              <TextInput
                style={s.input}
                value={niche}
                onChangeText={setNiche}
                placeholder="Ex: Marketing digital"
                placeholderTextColor={COLORS.text3}
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldLabel}>Investimento</Text>
              <TextInput
                style={s.input}
                value={invest}
                onChangeText={setInvest}
                placeholder="Ex: R$ 2.000/mês"
                placeholderTextColor={COLORS.text3}
              />
            </View>
          </View>

          {/* Modelo */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Modelo de negócio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.chipScrollRow}
            >
              {MODELS.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  style={[s.selectChip, modelIdx === i && s.selectChipActive]}
                  onPress={() => setModelIdx(i)}
                >
                  <Text
                    style={[
                      s.selectChipText,
                      modelIdx === i && s.selectChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Experiência */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>Experiência no nicho</Text>
            <View style={s.expRow}>
              {EXPERIENCES.map((e, i) => (
                <TouchableOpacity
                  key={e}
                  style={[s.expBtn, expIdx === i && s.expBtnActive]}
                  onPress={() => setExpIdx(i)}
                >
                  <Text
                    style={[s.expBtnText, expIdx === i && s.expBtnTextActive]}
                  >
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={validate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 16 }}>💡</Text>
                <Text style={s.btnText}>Validar com IA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result && (
          <View style={{ gap: SPACING.md }}>
            {/* Score + potencial */}
            <View style={[s.scoreCard, { borderTopColor: potColor }]}>
              <View style={s.scoreHeader}>
                <View style={s.scoreLeft}>
                  <Text style={[s.scoreNum, { color: potColor }]}>
                    {result.nota_viabilidade}
                  </Text>
                  <Text style={s.scoreDenom}>/10 viabilidade</Text>
                  <View style={[s.potBadge, { backgroundColor: potBg }]}>
                    <Text style={[s.potText, { color: potColor }]}>
                      Potencial {result.potencial}
                    </Text>
                  </View>
                </View>
                {result.resumo && <Text style={s.resumo}>{result.resumo}</Text>}
              </View>

              {/* Stats rápidos */}
              <View style={s.statsRow}>
                {result.tamanho_mercado && (
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>Mercado</Text>
                    <Text style={s.statVal} numberOfLines={2}>
                      {result.tamanho_mercado}
                    </Text>
                  </View>
                )}
                {result.nivel_concorrencia && (
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>Concorrência</Text>
                    <Text style={s.statVal}>{result.nivel_concorrencia}</Text>
                  </View>
                )}
                {result.tempo_para_roi && (
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>ROI estimado</Text>
                    <Text style={s.statVal} numberOfLines={2}>
                      {result.tempo_para_roi}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Público ideal */}
            {result.publico_ideal && (
              <View style={s.infoCard}>
                <Text style={s.infoTitle}>🎯 Público ideal</Text>
                <Text style={s.infoText}>{result.publico_ideal}</Text>
              </View>
            )}

            {/* Posicionamento */}
            {result.posicionamento && (
              <View style={s.infoCard}>
                <Text style={s.infoTitle}>💎 Posicionamento único</Text>
                <Text style={s.infoText}>{result.posicionamento}</Text>
              </View>
            )}

            {/* Promessa principal */}
            {result.promessa_principal && (
              <View style={s.promessaCard}>
                <View style={s.promessaHeader}>
                  <Text style={s.promessaTitle}>🔥 Promessa principal</Text>
                  <TouchableOpacity onPress={copyPromise}>
                    <Ionicons
                      name={copiedProm ? "checkmark" : "copy-outline"}
                      size={17}
                      color={copiedProm ? COLORS.green : COLORS.text2}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={s.promessaText} selectable>
                  "{result.promessa_principal}"
                </Text>
              </View>
            )}

            {/* Ângulos + Criativos */}
            <View style={s.twoColCards}>
              {result.angulos_copy?.length > 0 && (
                <View style={[s.halfCard, { flex: 1 }]}>
                  <Text style={s.halfCardTitle}>✍️ Ângulos de copy</Text>
                  {result.angulos_copy.map((a, i) => (
                    <ResultItem key={i} icon="💡" text={a} type="sug" />
                  ))}
                </View>
              )}
              {result.criativos_sugeridos?.length > 0 && (
                <View style={[s.halfCard, { flex: 1 }]}>
                  <Text style={s.halfCardTitle}>🎨 Criativos</Text>
                  {result.criativos_sugeridos.map((c, i) => (
                    <ResultItem key={i} icon="🎬" text={c} type="warn" />
                  ))}
                </View>
              )}
            </View>

            {/* Próximos passos */}
            {result.proximos_passos?.length > 0 && (
              <View style={s.stepsCard}>
                <Text style={s.stepsTitle}>🚀 Próximos passos</Text>
                {result.proximos_passos.map((step, i) => (
                  <View key={i} style={s.stepRow}>
                    <View style={s.stepNum}>
                      <Text style={s.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={s.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Riscos */}
            {result.riscos?.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: COLORS.red }]}>
                  ⚠️ Riscos
                </Text>
                {result.riscos.map((r, i) => (
                  <ResultItem key={i} icon="⚠️" text={r} type="neg" />
                ))}
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
    height: 130,
    paddingTop: 11,
    textAlignVertical: "top",
    marginBottom: 2,
  },
  charCount: { fontSize: 10, color: COLORS.text3, textAlign: "right" },
  twoCol: { flexDirection: "row", gap: SPACING.md },
  chipScrollRow: {
    marginHorizontal: -SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  selectChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  selectChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "18",
  },
  selectChipText: {
    fontSize: 12.5,
    color: COLORS.text2,
    fontFamily: FONTS.medium,
  },
  selectChipTextActive: { color: COLORS.accent2 },
  expRow: { flexDirection: "row", gap: 8 },
  expBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  expBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "18",
  },
  expBtnText: {
    fontSize: 11,
    color: COLORS.text2,
    textAlign: "center",
    fontFamily: FONTS.medium,
  },
  expBtnTextActive: { color: COLORS.accent2 },
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
    borderTopWidth: 3,
    overflow: "hidden",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  scoreLeft: { alignItems: "flex-start" },
  scoreNum: { fontSize: 44, fontFamily: FONTS.heading, lineHeight: 48 },
  scoreDenom: { fontSize: 11, color: COLORS.text2, marginBottom: 6 },
  potBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  potText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: "capitalize",
  },
  resumo: { flex: 1, fontSize: 12.5, color: COLORS.text2, lineHeight: 18 },
  statsRow: { flexDirection: "row", padding: SPACING.sm, gap: SPACING.sm },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  statLabel: { fontSize: 9.5, color: COLORS.text3, marginBottom: 3 },
  statVal: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.text },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text3,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  infoText: { fontSize: 13.5, color: COLORS.text, lineHeight: 20 },
  promessaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + "44",
    overflow: "hidden",
  },
  promessaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  promessaTitle: {
    fontSize: 13,
    fontFamily: FONTS.heading,
    color: COLORS.accent2,
  },
  promessaText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    padding: SPACING.md,
    lineHeight: 24,
  },
  twoColCards: { flexDirection: "row", gap: SPACING.sm },
  halfCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  halfCardTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text3,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepsTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text3,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent + "30",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.accent2,
  },
  stepText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18 },
  section: { gap: 5 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: "flex-start",
  },
  listItemText: { fontSize: 12.5, flex: 1, lineHeight: 18 },
});
