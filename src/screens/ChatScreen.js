/**
 * ConversãoAI Mobile — ChatScreen
 * Lista de especialistas para iniciar chat
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONTS } from "../constants/theme";

const SPECIALISTS = [
  {
    id: "COPYWRITER",
    emoji: "✍️",
    name: "Copywriter Expert",
    desc: "Copy de alta conversão, anúncios, VSL, email",
    color: "#6c4fff",
    tags: ["AIDA", "PAS", "Gatilhos", "Reescrita"],
    badge: null,
  },
  {
    id: "TRAFFIC_MANAGER",
    emoji: "📈",
    name: "Gestor de Tráfego",
    desc: "Meta Ads, Google Ads, TikTok Ads, redução de CPA",
    color: "#4f9fff",
    tags: ["Meta Ads", "Google", "TikTok", "ROI"],
    badge: null,
  },
  {
    id: "SALES_STRATEGIST",
    emoji: "💰",
    name: "Estrategista de Vendas",
    desc: "Funis, lançamentos, ofertas irresistíveis",
    color: "#1fd97a",
    tags: ["Funil", "Lançamento", "Upsell", "Oferta"],
    badge: null,
  },
  {
    id: "FUNNEL_EXPERT",
    emoji: "🎯",
    name: "Especialista em Funil",
    desc: "Jornada do cliente, automações, nurturing",
    color: "#0fd4b4",
    tags: ["Email seq", "Automação", "Remarketing"],
    badge: null,
  },
  {
    id: "LANDING_PAGE_EXPERT",
    emoji: "🖥️",
    name: "Landing Page Expert",
    desc: "Páginas de alta conversão, estrutura, CTA",
    color: "#ffb830",
    tags: ["VSL page", "Squeeze", "CTA", "Headline"],
    badge: null,
  },
  {
    id: "CREATIVE_ANALYST",
    emoji: "🎨",
    name: "Analista de Criativos",
    desc: "Hooks, imagens, vídeos, roteiros de anúncio",
    color: "#ff5fa0",
    tags: ["Hook", "CTR", "Vídeo", "Score"],
    badge: null,
  },
  {
    id: "INFOPRODUCT_EXPERT",
    emoji: "📚",
    name: "Infoproduto Expert",
    desc: "Cursos, mentorias, lançamentos, validação",
    color: "#ff7a40",
    tags: ["Curso", "Mentoria", "Lançamento", "PLR"],
    badge: "Novo",
  },
  {
    id: "ECOMMERCE_EXPERT",
    emoji: "🛒",
    name: "E-commerce Expert",
    desc: "Dropshipping, produtos, anúncios, conversão",
    color: "#9b7dff",
    tags: ["Drop", "Shopping", "Carrinho", "Retenção"],
    badge: null,
  },
];

function SpecialistCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.cardEmoji, { backgroundColor: item.color + "20" }]}>
        <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardDesc}>{item.desc}</Text>
        <View style={styles.tags}>
          {item.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: item.color + "18" }]}
            >
              <Text style={[styles.tagText, { color: item.color }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.text3} />
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  function startChat(specialist) {
    navigation.navigate("ChatSession", { specialist });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Chat com IA</Text>
        <Text style={styles.headerSub}>Escolha seu especialista</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {SPECIALISTS.map((s) => (
          <SpecialistCard key={s.id} item={s} onPress={() => startChat(s)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.text2, marginTop: 3 },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 24, gap: SPACING.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  cardEmoji: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  cardName: { fontSize: 14, fontFamily: FONTS.heading, color: COLORS.text },
  cardDesc: {
    fontSize: 12,
    color: COLORS.text2,
    marginBottom: 7,
    lineHeight: 17,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full },
  tagText: { fontSize: 10, fontFamily: FONTS.medium },
  badge: {
    backgroundColor: COLORS.pink + "22",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: 9, color: COLORS.pink, fontFamily: FONTS.medium },
});
