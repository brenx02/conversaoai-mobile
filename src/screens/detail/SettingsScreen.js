/**
 * ConversãoAI Mobile — SettingsScreen
 * NOVO ARQUIVO — configurações do aplicativo
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/auth.store";
import { userAPI } from "../../services/api";
import { COLORS, SPACING, RADIUS, FONTS } from "../../constants/theme";

// ─── Sub-componentes ──────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function RowItem({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}) {
  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View
        style={[
          s.rowIcon,
          { backgroundColor: (iconColor || COLORS.accent) + "20" },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor || COLORS.accent2} />
      </View>
      <Text style={[s.rowLabel, danger && { color: COLORS.red }]}>{label}</Text>
      {value !== undefined && <Text style={s.rowValue}>{value}</Text>}
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={15} color={COLORS.text3} />
      )}
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, iconColor, label, value, onValueChange }) {
  return (
    <View style={s.row}>
      <View
        style={[
          s.rowIcon,
          { backgroundColor: (iconColor || COLORS.accent) + "20" },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor || COLORS.accent2} />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.surface2, true: COLORS.accent }}
        thumbColor="#fff"
        ios_backgroundColor={COLORS.surface2}
      />
    </View>
  );
}

function Card({ children }) {
  return <View style={s.card}>{children}</View>;
}

// ─── Screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [notifications, setNotifications] = useState(
    user?.notifications ?? true,
  );
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? true);
  const [savingNotif, setSavingNotif] = useState(false);

  async function toggleNotifications(val) {
    setNotifications(val);
    setSavingNotif(true);
    try {
      await userAPI.updateProfile({ notifications: val });
      await updateUser({ notifications: val });
    } catch {
      setNotifications(!val); // reverte se falhar
    } finally {
      setSavingNotif(false);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Deletar conta",
      "Tem certeza? Esta ação é irreversível. Todos os seus dados, análises e histórico serão removidos permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar minha conta",
          style: "destructive",
          onPress: async () => {
            try {
              await userAPI.deleteAccount();
              await logout();
            } catch (err) {
              Alert.alert(
                "Erro",
                err.message ||
                  "Não foi possível deletar a conta. Contate o suporte.",
              );
            }
          },
        },
      ],
    );
  }

  function confirmLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout() },
    ]);
  }

  const planColor =
    user?.plan === "PREMIUM"
      ? COLORS.amber
      : user?.plan === "PRO"
        ? COLORS.accent2
        : COLORS.text3;
  const planLabel =
    user?.plan === "PREMIUM"
      ? "✦ Premium"
      : user?.plan === "PRO"
        ? "✦ Pro"
        : "Free";

  return (
    <View style={[s.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Perfil resumido */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={s.profileName}>{user?.name}</Text>
            <Text style={s.profileEmail}>{user?.email}</Text>
            <View
              style={[
                s.planBadge,
                {
                  backgroundColor: planColor + "20",
                  borderColor: planColor + "44",
                },
              ]}
            >
              <Text style={[s.planText, { color: planColor }]}>
                {planLabel}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => navigation.navigate("Plans")}
          >
            <Text style={s.editBtnText}>
              {user?.plan === "FREE" ? "Upgrade" : "Plano"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Uso de créditos */}
        {user?.plan !== "PREMIUM" && (
          <View style={s.creditsCard}>
            <View style={s.creditsRow}>
              <Text style={s.creditsLabel}>Créditos de IA usados</Text>
              <Text style={s.creditsVal}>
                {user?.aiCreditsUsed || 0}
                {" / "}
                {user?.aiCreditsLimit === -1 ? "∞" : user?.aiCreditsLimit || 10}
              </Text>
            </View>
            <View style={s.progressBg}>
              <View
                style={[
                  s.progressFill,
                  {
                    width: `${Math.min(
                      ((user?.aiCreditsUsed || 0) /
                        (user?.aiCreditsLimit || 10)) *
                        100,
                      100,
                    )}%`,
                    backgroundColor:
                      (user?.aiCreditsUsed || 0) >= (user?.aiCreditsLimit || 10)
                        ? COLORS.red
                        : COLORS.accent2,
                  },
                ]}
              />
            </View>
            {user?.plan === "FREE" && (
              <TouchableOpacity
                style={s.upgradeRow}
                onPress={() => navigation.navigate("Plans")}
                activeOpacity={0.8}
              >
                <Ionicons name="rocket" size={14} color={COLORS.accent2} />
                <Text style={s.upgradeText}>
                  Fazer upgrade para mais créditos
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={13}
                  color={COLORS.accent2}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Conta */}
        <SectionHeader title="Conta" />
        <Card>
          <RowItem
            icon="person-outline"
            iconColor={COLORS.accent2}
            label="Editar perfil"
            onPress={() =>
              Alert.alert(
                "Em breve",
                "Edição de perfil disponível na próxima versão.",
              )
            }
          />
          <RowItem
            icon="lock-closed-outline"
            iconColor={COLORS.amber}
            label="Alterar senha"
            onPress={() =>
              Alert.alert(
                "Em breve",
                "Alteração de senha disponível na próxima versão.",
              )
            }
          />
          <RowItem
            icon="card-outline"
            iconColor={COLORS.green}
            label="Assinatura e plano"
            value={planLabel}
            onPress={() => navigation.navigate("Plans")}
          />
        </Card>

        {/* Preferências */}
        <SectionHeader title="Preferências" />
        <Card>
          <ToggleRow
            icon="notifications-outline"
            iconColor={COLORS.blue}
            label="Notificações"
            value={notifications}
            onValueChange={toggleNotifications}
          />
          <ToggleRow
            icon="moon-outline"
            iconColor={COLORS.accent2}
            label="Modo escuro"
            value={darkMode}
            onValueChange={(val) => {
              setDarkMode(val);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // darkMode é sempre true neste app — toggle mantido para UX
            }}
          />
          <RowItem
            icon="language-outline"
            iconColor={COLORS.teal || "#0fd4b4"}
            label="Idioma"
            value="Português"
            showChevron={false}
          />
        </Card>

        {/* Suporte */}
        <SectionHeader title="Suporte" />
        <Card>
          <RowItem
            icon="help-circle-outline"
            iconColor={COLORS.green}
            label="Central de ajuda"
            onPress={() =>
              Linking.openURL("https://conversaoai.com.br/ajuda").catch(
                () => {},
              )
            }
          />
          <RowItem
            icon="chatbubble-ellipses-outline"
            iconColor={COLORS.blue}
            label="Falar com suporte"
            onPress={() =>
              Linking.openURL("mailto:suporte@conversaoai.com.br").catch(
                () => {},
              )
            }
          />
          <RowItem
            icon="star-outline"
            iconColor={COLORS.amber}
            label="Avaliar o app"
            onPress={() =>
              Alert.alert(
                "Obrigado! 🙏",
                "A avaliação estará disponível quando o app for publicado na loja.",
              )
            }
          />
          <RowItem
            icon="share-social-outline"
            iconColor={COLORS.pink}
            label="Compartilhar com amigos"
            onPress={() =>
              Alert.alert(
                "Em breve",
                "Compartilhamento disponível na próxima versão.",
              )
            }
          />
        </Card>

        {/* Legal */}
        <SectionHeader title="Legal" />
        <Card>
          <RowItem
            icon="document-text-outline"
            iconColor={COLORS.text2}
            label="Termos de uso"
            onPress={() =>
              Linking.openURL("https://conversaoai.com.br/termos").catch(
                () => {},
              )
            }
          />
          <RowItem
            icon="shield-outline"
            iconColor={COLORS.text2}
            label="Política de privacidade"
            onPress={() =>
              Linking.openURL("https://conversaoai.com.br/privacidade").catch(
                () => {},
              )
            }
          />
        </Card>

        {/* Conta — ações perigosas */}
        <SectionHeader title="Sessão" />
        <Card>
          <RowItem
            icon="log-out-outline"
            iconColor={COLORS.red}
            label="Sair da conta"
            danger
            onPress={confirmLogout}
          />
        </Card>

        <TouchableOpacity
          style={s.deleteBtn}
          onPress={confirmDeleteAccount}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={15} color={COLORS.red} />
          <Text style={s.deleteBtnText}>Deletar minha conta</Text>
        </TouchableOpacity>

        {/* Versão */}
        <Text style={s.version}>
          ConversãoAI v1.0.0 · Marketing Intelligence
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const TEAL = "#0fd4b4";

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 32,
  },

  // Profile card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: { fontSize: 22, fontFamily: FONTS.heading, color: "#fff" },
  profileName: {
    fontSize: 16,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 2,
  },
  profileEmail: { fontSize: 12, color: COLORS.text2, marginBottom: 6 },
  planBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  planText: { fontSize: 10.5, fontFamily: FONTS.medium },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent + "20",
    borderWidth: 1,
    borderColor: COLORS.accent + "44",
  },
  editBtnText: {
    fontSize: 12,
    color: COLORS.accent2,
    fontFamily: FONTS.medium,
  },

  // Credits
  creditsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  creditsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  creditsLabel: { fontSize: 13, color: COLORS.text2 },
  creditsVal: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.text },
  progressBg: {
    height: 5,
    backgroundColor: COLORS.surface2,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: { height: 5, borderRadius: 3 },
  upgradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  upgradeText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.accent2,
    fontFamily: FONTS.medium,
  },

  // Section
  sectionHeader: {
    fontSize: 10.5,
    fontFamily: FONTS.medium,
    color: COLORS.text3,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 0,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.body,
  },
  rowValue: { fontSize: 12, color: COLORS.text2, marginRight: 4 },

  // Delete
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.redBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.red + "33",
    marginTop: SPACING.xl,
  },
  deleteBtnText: {
    fontSize: 13.5,
    color: COLORS.red,
    fontFamily: FONTS.medium,
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.text3,
    marginTop: SPACING.xl,
  },
});
