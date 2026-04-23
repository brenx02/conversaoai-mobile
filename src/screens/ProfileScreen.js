/**
 * ConversãoAI Mobile — ProfileScreen
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';
import { useNavigation }      from '@react-navigation/native';
import { useAuthStore }       from '../store/auth.store';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

function MenuItem({ icon, label, value, color, onPress, chevron = true }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: (color || COLORS.accent) + '20' }]}>
        <Ionicons name={icon} size={18} color={color || COLORS.accent2} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {chevron && <Ionicons name="chevron-forward" size={16} color={COLORS.text3} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const planColor = user?.plan === 'PREMIUM' ? COLORS.amber : user?.plan === 'PRO' ? COLORS.accent2 : COLORS.text3;

  function confirmLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.planBadge, { backgroundColor: planColor + '20', borderColor: planColor + '44' }]}>
            <Text style={[styles.planText, { color: planColor }]}>✦ Plano {user?.plan || 'FREE'}</Text>
          </View>
        </View>

        {/* Uso */}
        <View style={styles.usageCard}>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Créditos usados</Text>
            <Text style={styles.usageVal}>{user?.aiCreditsUsed || 0} / {user?.aiCreditsLimit === -1 ? '∞' : user?.aiCreditsLimit}</Text>
          </View>
          {user?.plan !== 'PREMIUM' && (
            <View style={styles.usageBar}>
              <View style={[styles.usageFill, {
                width: `${Math.min(((user?.aiCreditsUsed || 0) / (user?.aiCreditsLimit || 10)) * 100, 100)}%`,
                backgroundColor: (user?.aiCreditsUsed || 0) >= (user?.aiCreditsLimit || 10) ? COLORS.red : COLORS.accent2,
              }]} />
            </View>
          )}
          {user?.plan === 'FREE' && (
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Plans')}>
              <Ionicons name="rocket" size={14} color="#fff" />
              <Text style={styles.upgradeBtnText}>Fazer Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="person-outline"    label="Editar perfil"       onPress={() => {}} color={COLORS.accent2} />
            <MenuItem icon="lock-closed-outline" label="Alterar senha"     onPress={() => {}} color={COLORS.amber} />
            <MenuItem icon="card-outline"      label="Assinatura"          value={user?.plan} onPress={() => navigation.navigate('Plans')} color={COLORS.green} />
            <MenuItem icon="notifications-outline" label="Notificações"    onPress={() => {}} color={COLORS.blue} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="moon-outline"      label="Modo escuro"         value="Ativo" onPress={() => {}} color={COLORS.accent2} chevron={false} />
            <MenuItem icon="language-outline"  label="Idioma"              value="Português" onPress={() => {}} color={COLORS.amber} chevron={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="help-circle-outline" label="Central de ajuda"  onPress={() => {}} color={COLORS.teal} />
            <MenuItem icon="chatbubble-outline"  label="Falar com suporte" onPress={() => {}} color={COLORS.blue} />
            <MenuItem icon="document-text-outline" label="Termos de uso"   onPress={() => {}} color={COLORS.text2} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ConversãoAI v1.0.0 · Marketing Intelligence</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  content:       { paddingHorizontal: SPACING.xl, paddingBottom: 32 },
  avatarWrap:    { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xl },
  avatar:        { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLetter:  { fontSize: 28, fontFamily: FONTS.heading, color: '#fff' },
  name:          { fontSize: 20, fontFamily: FONTS.heading, color: COLORS.text },
  email:         { fontSize: 13, color: COLORS.text2, marginTop: 4 },
  planBadge:     { marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  planText:      { fontSize: 12, fontFamily: FONTS.medium },
  usageCard:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  usageRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  usageLabel:    { fontSize: 13, color: COLORS.text2 },
  usageVal:      { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.text },
  usageBar:      { height: 5, backgroundColor: COLORS.surface2, borderRadius: 3, overflow: 'hidden', marginBottom: SPACING.sm },
  usageFill:     { height: 5, borderRadius: 3 },
  upgradeBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: 10 },
  upgradeBtnText:{ fontSize: 13, fontFamily: FONTS.heading, color: '#fff' },
  section:       { marginBottom: SPACING.lg },
  sectionTitle:  { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  menuCard:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  menuItem:      { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  menuIcon:      { width: 34, height: 34, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  menuLabel:     { flex: 1, fontSize: 14, color: COLORS.text, fontFamily: FONTS.body },
  menuValue:     { fontSize: 12, color: COLORS.text2, marginRight: 4 },
  logoutBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.redBg, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.red + '44', marginBottom: SPACING.lg },
  logoutText:    { fontSize: 14, color: COLORS.red, fontFamily: FONTS.medium },
  version:       { textAlign: 'center', fontSize: 11, color: COLORS.text3 },
});
