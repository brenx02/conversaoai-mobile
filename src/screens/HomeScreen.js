/**
 * ConversãoAI Mobile — HomeScreen
 * Dashboard principal
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';
import { useNavigation }      from '@react-navigation/native';
import { useAuthStore }       from '../store/auth.store';
import { analysisAPI, billingAPI } from '../services/api';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

// ─── DATA ──────────────────────────────────────────────────────────────────

const QUICK_TOOLS = [
  { id: 'chat',       icon: 'chatbubbles',  label: 'Chat IA',        color: '#6c4fff', screen: 'Chat',       badge: null },
  { id: 'creative',   icon: 'image',        label: 'Criativo',       color: '#ffb830', screen: 'Creative',   badge: null },
  { id: 'page',       icon: 'document',     label: 'Página',         color: '#4f9fff', screen: 'LandingPage', badge: null },
  { id: 'copy',       icon: 'create',       label: 'Gerar Copy',     color: '#1fd97a', screen: 'Criar',      badge: null },
  { id: 'campaign',   icon: 'rocket',       label: 'Campanha',       color: '#ff5fa0', screen: 'Campaign',   badge: null },
  { id: 'validate',   icon: 'bulb',         label: 'Validar Ideia',  color: '#0fd4b4', screen: 'Validate',   badge: null },
  { id: 'traffic',    icon: 'trending-up',  label: 'Tráfego',        color: '#ff7a40', screen: 'Traffic',    badge: null },
  { id: 'history',    icon: 'time',         label: 'Histórico',      color: '#9b7dff', screen: 'Histórico',  badge: null },
];

const INSIGHTS = [
  { icon: '🔥', title: 'Hook nos 3 primeiros segundos', text: '70% decide parar no 1º segundo. Ataque a dor imediatamente.' },
  { icon: '🎯', title: 'Especificidade converte mais', text: '"Perca 7kg em 21 dias" converte 3x mais que "Emagreça rápido".' },
  { icon: '📊', title: 'CTR < 1%? Mude o criativo', text: 'O problema não é a audiência. Mude o hook antes da segmentação.' },
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────

function StatCard({ value, label, color, icon }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ToolButton({ icon, label, color, onPress, badge }) {
  return (
    <TouchableOpacity style={styles.toolBtn} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.toolIconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
        {badge && (
          <View style={styles.toolBadge}>
            <Text style={styles.toolBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.toolLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function InsightCard({ icon, title, text }) {
  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightText}>{text}</Text>
      </View>
    </View>
  );
}

function RecentItem({ item, onPress }) {
  const typeColors = {
    CREATIVE: '#ffb830', LANDING_PAGE: '#4f9fff', COPY_GENERATION: '#1fd97a',
    CAMPAIGN: '#ff5fa0', IDEA_VALIDATION: '#9b7dff', TRAFFIC: '#ff7a40',
  };
  const typeEmojis = {
    CREATIVE: '🎨', LANDING_PAGE: '📄', COPY_GENERATION: '✍️',
    CAMPAIGN: '🚀', IDEA_VALIDATION: '💡', TRAFFIC: '📈',
  };
  const color = typeColors[item.type] || '#6c4fff';
  const emoji = typeEmojis[item.type] || '📊';

  return (
    <TouchableOpacity style={styles.recentItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.recentIcon, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentMeta}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          {item.product ? ` · ${item.product}` : ''}
        </Text>
      </View>
      {item.score != null && (
        <Text style={[styles.recentScore, { color: item.score >= 8 ? COLORS.green : item.score >= 6 ? COLORS.amber : COLORS.red }]}>
          {item.score.toFixed(1)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── SCREEN ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const user       = useAuthStore(s => s.user);

  const [recentItems, setRecentItems] = useState([]);
  const [usage,       setUsage]       = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);

  async function loadData() {
    try {
      const [histRes, usageRes] = await Promise.allSettled([
        analysisAPI.list({ limit: 5, page: 1 }),
        billingAPI.usage(),
      ]);
      if (histRes.status === 'fulfilled')  setRecentItems(histRes.value.data?.data || []);
      if (usageRes.status === 'fulfilled') setUsage(usageRes.value.data?.data);
    } catch (e) {
      console.warn('Load data error:', e);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const planColor = user?.plan === 'PREMIUM' ? COLORS.amber : user?.plan === 'PRO' ? COLORS.accent2 : COLORS.text3;
  const creditsPercent = usage ? Math.min((usage.creditsUsed / usage.creditsLimit) * 100, 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent2} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.planText}>⚡ {user?.plan || 'FREE'}</Text>
              {user?.plan !== 'PREMIUM' && (
                <TouchableOpacity onPress={() => navigation.navigate('Plans')}>
                  <Text style={styles.upgradeText}>Fazer upgrade →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color={COLORS.text2} />
          </TouchableOpacity>
        </View>

        {/* CRÉDITOS */}
        {user?.plan !== 'PREMIUM' && (
          <View style={styles.creditsCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={styles.creditsLabel}>Créditos de IA</Text>
              <Text style={styles.creditsValue}>
                {usage?.creditsUsed || 0} / {usage?.creditsLimit || user?.aiCreditsLimit || 10}
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${creditsPercent}%`, backgroundColor: creditsPercent > 80 ? COLORS.red : COLORS.accent2 }]} />
            </View>
          </View>
        )}

        {/* STATS */}
        <View style={styles.statsRow}>
          <StatCard value={usage?.analyses || 0}    label="Análises"    color={COLORS.accent2} icon="📊" />
          <StatCard value={usage?.copies || 0}      label="Copies"      color={COLORS.green}   icon="✍️" />
          <StatCard value={usage?.campaigns || 0}   label="Campanhas"   color={COLORS.pink}    icon="🚀" />
        </View>

        {/* FERRAMENTAS RÁPIDAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ferramentas</Text>
          <View style={styles.toolsGrid}>
            {QUICK_TOOLS.map(tool => (
              <ToolButton
                key={tool.id}
                icon={tool.icon}
                label={tool.label}
                color={tool.color}
                badge={tool.badge}
                onPress={() => navigation.navigate(tool.screen)}
              />
            ))}
          </View>
        </View>

        {/* INSIGHTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights do dia</Text>
          {INSIGHTS.map((ins, i) => <InsightCard key={i} {...ins} />)}
        </View>

        {/* HISTÓRICO RECENTE */}
        {recentItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🕐 Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Histórico')}>
                <Text style={styles.seeAll}>Ver todos →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentCard}>
              {recentItems.map((item, i) => (
                <RecentItem
                  key={item.id}
                  item={item}
                  onPress={() => {}} // Abre detalhe
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  greeting:        { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.text, letterSpacing: -0.5 },
  planText:        { fontSize: 12, color: COLORS.accent2, fontFamily: FONTS.medium },
  upgradeText:     { fontSize: 11, color: COLORS.teal, fontFamily: FONTS.medium },
  settingsBtn:     { padding: SPACING.sm },
  creditsCard:     { marginHorizontal: SPACING.xl, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  creditsLabel:    { fontSize: 12, color: COLORS.text2, fontFamily: FONTS.body },
  creditsValue:    { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.text },
  progressBg:      { height: 4, backgroundColor: COLORS.surface2, borderRadius: 2, overflow: 'hidden' },
  progressFill:    { height: 4, borderRadius: 2 },
  statsRow:        { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.md },
  statCard:        { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderTopWidth: 2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  statIcon:        { fontSize: 18, marginBottom: 4 },
  statValue:       { fontSize: 22, fontFamily: FONTS.heading, letterSpacing: -0.5 },
  statLabel:       { fontSize: 10, color: COLORS.text2, marginTop: 2, textAlign: 'center' },
  section:         { paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle:    { fontSize: 15, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.sm },
  seeAll:          { fontSize: 12, color: COLORS.accent2 },
  toolsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  toolBtn:         { width: (width - SPACING.xl * 2 - SPACING.sm * 3) / 4, alignItems: 'center', gap: 6 },
  toolIconWrap:    { width: 52, height: 52, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  toolBadge:       { position: 'absolute', top: -4, right: -6, backgroundColor: COLORS.pink, borderRadius: RADIUS.full, paddingHorizontal: 4, paddingVertical: 1 },
  toolBadgeText:   { fontSize: 8, color: '#fff', fontFamily: FONTS.medium },
  toolLabel:       { fontSize: 10, color: COLORS.text2, textAlign: 'center', fontFamily: FONTS.body },
  insightCard:     { flexDirection: 'row', gap: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  insightIcon:     { fontSize: 18 },
  insightTitle:    { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.text, marginBottom: 3 },
  insightText:     { fontSize: 12, color: COLORS.text2, lineHeight: 17 },
  recentCard:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  recentItem:      { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  recentIcon:      { width: 38, height: 38, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  recentTitle:     { fontSize: 13.5, fontFamily: FONTS.medium, color: COLORS.text },
  recentMeta:      { fontSize: 11, color: COLORS.text2, marginTop: 2 },
  recentScore:     { fontSize: 16, fontFamily: FONTS.heading },
});
