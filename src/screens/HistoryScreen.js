/**
 * ConversãoAI Mobile — HistoryScreen
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { analysisAPI, copyAPI } from "../services/api";
import { COLORS, SPACING, RADIUS, FONTS } from "../constants/theme";

const TABS = ["Análises", "Copies", "Favoritos"];
const EMOJIS = {
  CREATIVE: "🎨",
  LANDING_PAGE: "📄",
  COPY_GENERATION: "✍️",
  CAMPAIGN: "🚀",
  IDEA_VALIDATION: "💡",
  TRAFFIC: "📈",
  AB_TEST: "⚖️",
};
const TYPE_CLR = {
  CREATIVE: "#ffb830",
  LANDING_PAGE: "#4f9fff",
  COPY_GENERATION: "#1fd97a",
  CAMPAIGN: "#ff5fa0",
  IDEA_VALIDATION: "#9b7dff",
  TRAFFIC: "#ff7a40",
  AB_TEST: "#0fd4b4",
};

function HistoryItem({ item, onDelete, onFav }) {
  const isAnalysis = item.type !== undefined;
  const color = TYPE_CLR[item.type || "COPY_GENERATION"] || "#6c4fff";
  const emoji = EMOJIS[item.type || "COPY_GENERATION"] || "✍️";

  return (
    <View style={styles.item}>
      <View style={[styles.itemIcon, { backgroundColor: color + "20" }]}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title || item.copyType}
        </Text>
        <Text style={styles.itemMeta}>
          {new Date(item.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          {item.product ? ` · ${item.product}` : ""}
        </Text>
      </View>
      <View style={styles.itemRight}>
        {item.score != null && (
          <Text
            style={[
              styles.score,
              {
                color:
                  item.score >= 8
                    ? COLORS.green
                    : item.score >= 6
                      ? COLORS.amber
                      : COLORS.red,
              },
            ]}
          >
            {item.score.toFixed(1)}
          </Text>
        )}
        <TouchableOpacity onPress={() => onFav(item)} style={styles.iconBtn}>
          <Ionicons
            name={item.isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={item.isFavorite ? COLORS.pink : COLORS.text3}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={17} color={COLORS.text3} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [analyses, setAnalyses] = useState([]);
  const [copies, setCopies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function loadData(reset = false) {
    if (loading && !reset) return;
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const [aRes, cRes, fRes] = await Promise.allSettled([
        analysisAPI.list({ page: p, limit: 20 }),
        copyAPI.list({ page: p, limit: 20 }),
        analysisAPI.favorites(),
      ]);
      if (aRes.status === "fulfilled") {
        const d = aRes.value.data?.data || [];
        setAnalyses(reset ? d : (prev) => [...prev, ...d]);
        setHasMore(d.length === 20);
      }
      if (cRes.status === "fulfilled") setCopies(cRes.value.data?.data || []);
      if (fRes.status === "fulfilled")
        setFavorites(fRes.value.data?.data || []);
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => {
    loadData(true);
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    setPage(1);
    await loadData(true);
    setRefreshing(false);
  }

  async function handleDelete(item) {
    Alert.alert("Deletar", "Remover esta análise?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          await analysisAPI.delete(item.id).catch(() => {});
          setAnalyses((p) => p.filter((a) => a.id !== item.id));
        },
      },
    ]);
  }

  async function handleFav(item) {
    await analysisAPI.toggleFav(item.id).catch(() => {});
    setAnalyses((p) =>
      p.map((a) =>
        a.id === item.id ? { ...a, isFavorite: !a.isFavorite } : a,
      ),
    );
  }

  const data = [analyses, copies, favorites][tab];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🕐 Histórico</Text>
      </View>
      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === i && styles.tabBtnActive]}
            onPress={() => setTab(i)}
          >
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem item={item} onDelete={handleDelete} onFav={handleFav} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent2}
          />
        }
        onEndReached={() => {
          if (hasMore && tab === 0) {
            setPage((p) => p + 1);
            loadData();
          }
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.text },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.accent + "20",
    borderColor: COLORS.accent,
  },
  tabText: { fontSize: 13, color: COLORS.text2, fontFamily: FONTS.medium },
  tabTextActive: { color: COLORS.accent2 },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 32, gap: SPACING.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: { fontSize: 13.5, fontFamily: FONTS.medium, color: COLORS.text },
  itemMeta: { fontSize: 11, color: COLORS.text2, marginTop: 2 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  score: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    minWidth: 30,
    textAlign: "right",
  },
  iconBtn: { padding: 6 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 14, color: COLORS.text3 },
});
