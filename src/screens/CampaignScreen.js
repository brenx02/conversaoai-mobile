/**
 * ConversãoAI Mobile — CampaignScreen
 * NOVO ARQUIVO — criador de campanhas completas
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
import { aiAPI } from "../services/api";
import { COLORS, SPACING, RADIUS, FONTS } from "../constants/theme";

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
    desc: "Search / Display / YT",
  },
  {
    id: "TikTok Ads",
    icon: "🎵",
    label: "TikTok Ads",
    desc: "In-feed / TopView",
  },
  {
    id: "Multi-plataforma",
    icon: "🌐",
    label: "Multi",
    desc: "Todas as plataformas",
  },
];

const GOALS = [
  "Venda direta",
  "Geração de leads",
  "Retargeting",
  "Reconhecimento de marca",
];

export default function CampaignScreen() {
  const insets = useSafeAreaInsets();

  const [platform, setPlatform] = useState("Meta Ads");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("Venda direta");
  const [price, setPrice] = useState("");
  const [budget, setBudget] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!product.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome do produto.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await aiAPI.createCampaign({
        product: product.trim(),
        description: description.trim(),
        goal,
        platform,
        budget: budget.trim(),
        audience: audience.trim(),
        price: price.trim(),
      });
      setResult(res.data.campaign?.content || res.data.content || "");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if (err.upgrade) {
        Alert.alert(
          "Upgrade necessário",
          "Criação de campanhas completas requer plano Pro ou Premium.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert("Erro", err.message || "Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await Clipboard.setStringAsync(result);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>🚀 Criar Campanha</Text>
        <Text style={styles.sub}>
          A IA gera estrutura, criativos, copies e estratégia de testes
          completos
        </Text>

        {/* Plataforma */}
        <Text style={styles.fieldLabel}>Plataforma</Text>
        <View style={styles.platformGrid}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.platformCard,
                platform === p.id && styles.platformCardActive,
              ]}
              onPress={() => setPlatform(p.id)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 22 }}>{p.icon}</Text>
              <Text
                style={[
                  styles.platformLabel,
                  platform === p.id && styles.platformLabelActive,
                ]}
              >
                {p.label}
              </Text>
              <Text style={styles.platformDesc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Objetivo */}
        <Text style={styles.fieldLabel}>Objetivo da campanha</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
        >
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, goal === g && styles.chipActive]}
              onPress={() => setGoal(g)}
            >
              <Text
                style={[styles.chipText, goal === g && styles.chipTextActive]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Produto / Serviço *</Text>
            <TextInput
              style={styles.input}
              value={product}
              onChangeText={setProduct}
              placeholder="Ex: Mentoria de Tráfego Premium"
              placeholderTextColor={COLORS.text3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Descrição da oferta</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="O que entrega? Qual resultado? O que inclui?"
              placeholderTextColor={COLORS.text3}
              multiline
            />
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Preço</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="R$ 497"
                placeholderTextColor={COLORS.text3}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Orçamento/mês</Text>
              <TextInput
                style={styles.input}
                value={budget}
                onChangeText={setBudget}
                placeholder="R$ 2.000"
                placeholderTextColor={COLORS.text3}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Público-alvo</Text>
            <TextInput
              style={styles.input}
              value={audience}
              onChangeText={setAudience}
              placeholder="Ex: Empreendedores 25-45 anos, faturamento R$5-50k/mês"
              placeholderTextColor={COLORS.text3}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={generate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 16 }}>🚀</Text>
                <Text style={styles.btnText}>Criar Campanha Completa</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>🎯 Campanha gerada</Text>
                <View style={styles.resultMeta}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{platform}</Text>
                  </View>
                  <View
                    style={[
                      styles.metaBadge,
                      { backgroundColor: COLORS.greenBg },
                    ]}
                  >
                    <Text
                      style={[styles.metaBadgeText, { color: COLORS.green }]}
                    >
                      Completa
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.copyBtn} onPress={copyResult}>
                <Ionicons
                  name={copied ? "checkmark-circle" : "copy-outline"}
                  size={20}
                  color={copied ? COLORS.green : COLORS.text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText} selectable>
              {result}
            </Text>

            <TouchableOpacity style={styles.regenBtn} onPress={generate}>
              <Ionicons name="refresh" size={16} color={COLORS.accent2} />
              <Text style={styles.regenText}>Gerar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  platformCard: {
    flex: 1,
    minWidth: "44%",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  platformCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "18",
  },
  platformLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text2,
  },
  platformLabelActive: { color: COLORS.accent2 },
  platformDesc: { fontSize: 10, color: COLORS.text3, textAlign: "center" },
  chipRow: {
    marginHorizontal: -SPACING.xl,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "18",
  },
  chipText: { fontSize: 13, color: COLORS.text2, fontFamily: FONTS.medium },
  chipTextActive: { color: COLORS.accent2 },
  form: { gap: SPACING.md, marginBottom: SPACING.lg },
  field: { gap: 6 },
  twoCol: { flexDirection: "row", gap: SPACING.md },
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
  textarea: { height: 90, paddingTop: 11, textAlignVertical: "top" },
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
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 6,
  },
  resultMeta: { flexDirection: "row", gap: 6 },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent + "20",
  },
  metaBadgeText: {
    fontSize: 10,
    color: COLORS.accent2,
    fontFamily: FONTS.medium,
  },
  copyBtn: { padding: 4 },
  resultText: {
    fontSize: 13.5,
    color: COLORS.text,
    lineHeight: 22,
    padding: SPACING.md,
  },
  regenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  regenText: { fontSize: 13, color: COLORS.accent2, fontFamily: FONTS.medium },
});
