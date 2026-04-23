/**
 * ConversãoAI Mobile — PlansScreen
 * Planos Free, Pro e Premium
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';
import { useNavigation }      from '@react-navigation/native';
import { billingAPI }         from '../../services/api';
import { useAuthStore }       from '../../store/auth.store';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';

const PLANS = [
  {
    id:       'FREE',
    name:     'Free',
    price:    'R$ 0',
    period:   '/mês',
    color:    COLORS.text3,
    popular:  false,
    features: [
      { ok: true,  text: '10 análises por mês' },
      { ok: true,  text: 'Chat com IA (básico)' },
      { ok: true,  text: 'Gerador de copy' },
      { ok: true,  text: 'Validador de ideias' },
      { ok: false, text: 'Análises ilimitadas' },
      { ok: false, text: 'Upload de imagens' },
      { ok: false, text: 'Campanhas completas' },
      { ok: false, text: 'Sequência de emails' },
    ],
  },
  {
    id:       'PRO',
    name:     'Pro',
    price:    'R$ 97',
    period:   '/mês',
    priceYear:'R$ 67/mês',
    yearNote: 'Cobrado R$ 797/ano',
    color:    COLORS.accent2,
    popular:  true,
    priceId:  'STRIPE_PRICE_PRO_MONTHLY',
    features: [
      { ok: true, text: '500 análises por mês' },
      { ok: true, text: 'Chat com IA avançado' },
      { ok: true, text: 'Todos os geradores de copy' },
      { ok: true, text: 'Análise de criativos com score' },
      { ok: true, text: 'Página de vendas completa' },
      { ok: true, text: 'Criador de campanhas' },
      { ok: true, text: 'Upload de imagens' },
      { ok: false, text: 'Estratégias completas' },
      { ok: false, text: 'Acesso prioritário à IA' },
    ],
  },
  {
    id:       'PREMIUM',
    name:     'Premium',
    price:    'R$ 197',
    period:   '/mês',
    priceYear:'R$ 147/mês',
    yearNote: 'Cobrado R$ 1.764/ano',
    color:    COLORS.amber,
    popular:  false,
    priceId:  'STRIPE_PRICE_PREMIUM_MONTHLY',
    features: [
      { ok: true, text: 'Análises ilimitadas' },
      { ok: true, text: 'IA de máxima potência' },
      { ok: true, text: 'Funis completos de vendas' },
      { ok: true, text: 'Sequências de email completas' },
      { ok: true, text: 'Scripts de vendas' },
      { ok: true, text: 'Construtor de avatar (ICP)' },
      { ok: true, text: 'Calculadora ROI avançada' },
      { ok: true, text: 'Análise de concorrentes' },
      { ok: true, text: 'Acesso prioritário + suporte' },
    ],
  },
];

export default function PlansScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();
  const user       = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [billing,  setBilling]  = useState('monthly'); // 'monthly' | 'yearly'
  const [loading,  setLoading]  = useState('');

  async function subscribe(plan) {
    if (plan.id === 'FREE') return;
    if (user?.plan === plan.id) {
      Alert.alert('Plano atual', `Você já está no plano ${plan.name}.`);
      return;
    }

    setLoading(plan.id);
    try {
      const priceId = billing === 'yearly'
        ? plan.priceId?.replace('MONTHLY', 'YEARLY')
        : plan.priceId;

      const res = await billingAPI.subscribe({ planId: plan.id, priceId, billing });

      // Em produção abrira Stripe checkout ou payment sheet
      // Por ora simula sucesso
      await updateUser({ plan: plan.id });
      navigation.goBack();
      Alert.alert('✅ Upgrade realizado!', `Você agora tem acesso ao plano ${plan.name}.`);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível processar o pagamento.');
    } finally {
      setLoading('');
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Escolha seu plano</Text>
        <Text style={styles.sub}>Invista em IA que paga por si mesma 💰</Text>

        {/* Billing toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.billingBtn, billing === 'monthly' && styles.billingBtnActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.billingBtnText, billing === 'monthly' && styles.billingBtnTextActive]}>Mensal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingBtn, billing === 'yearly' && styles.billingBtnActive]}
            onPress={() => setBilling('yearly')}
          >
            <Text style={[styles.billingBtnText, billing === 'yearly' && styles.billingBtnTextActive]}>Anual</Text>
            <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>-30%</Text></View>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        {PLANS.map(plan => {
          const isCurrent = user?.plan === plan.id;
          const price     = billing === 'yearly' && plan.priceYear ? plan.priceYear : plan.price;

          return (
            <View key={plan.id} style={[styles.planCard, plan.popular && styles.planCardPopular, { borderColor: isCurrent ? plan.color : plan.popular ? plan.color + '44' : COLORS.border }]}>
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.popularBadgeText}>🔥 Mais popular</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                <View>
                  <Text style={styles.planPrice}>{price}</Text>
                  {billing === 'yearly' && plan.yearNote && (
                    <Text style={styles.planYearNote}>{plan.yearNote}</Text>
                  )}
                </View>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons
                      name={f.ok ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={f.ok ? COLORS.green : COLORS.text3}
                    />
                    <Text style={[styles.featureText, !f.ok && styles.featureTextOff]}>{f.text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.planBtn,
                  isCurrent && styles.planBtnCurrent,
                  plan.id === 'FREE' && styles.planBtnFree,
                  { backgroundColor: isCurrent ? 'transparent' : plan.popular ? plan.color : plan.color + '22', borderColor: plan.color },
                ]}
                onPress={() => subscribe(plan)}
                disabled={isCurrent || loading === plan.id}
                activeOpacity={0.8}
              >
                {loading === plan.id
                  ? <ActivityIndicator color={plan.color} size="small" />
                  : <Text style={[styles.planBtnText, { color: isCurrent || plan.id === 'FREE' ? plan.color : plan.popular ? '#fff' : plan.color }]}>
                      {isCurrent ? '✅ Plano atual' : plan.id === 'FREE' ? 'Plano gratuito' : `Assinar ${plan.name}`}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.footer}>
          💳 Pagamento seguro via Stripe · Cancele quando quiser · Garantia de 7 dias
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: COLORS.bg },
  content:             { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 32 },
  title:               { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: 6 },
  sub:                 { fontSize: 14, color: COLORS.text2, marginBottom: SPACING.xl },
  billingToggle:       { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.xl, alignSelf: 'center' },
  billingBtn:          { paddingHorizontal: 24, paddingVertical: 8, borderRadius: RADIUS.sm, flexDirection: 'row', alignItems: 'center', gap: 6 },
  billingBtnActive:    { backgroundColor: COLORS.accent },
  billingBtnText:      { fontSize: 13, color: COLORS.text2, fontFamily: FONTS.medium },
  billingBtnTextActive:{ color: '#fff' },
  saveBadge:           { backgroundColor: COLORS.green, borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 },
  saveBadgeText:       { fontSize: 9, color: '#fff', fontFamily: FONTS.medium },
  planCard:            { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  planCardPopular:     { borderWidth: 2 },
  popularBadge:        { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginBottom: SPACING.md },
  popularBadgeText:    { fontSize: 11, color: '#fff', fontFamily: FONTS.medium },
  planHeader:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  planName:            { fontSize: 20, fontFamily: FONTS.heading },
  planPrice:           { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.text, textAlign: 'right' },
  planYearNote:        { fontSize: 10, color: COLORS.text3, textAlign: 'right' },
  featureList:         { gap: 9, marginBottom: SPACING.lg },
  featureRow:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText:         { fontSize: 13, color: COLORS.text },
  featureTextOff:      { color: COLORS.text3 },
  planBtn:             { borderRadius: RADIUS.md, paddingVertical: 13, alignItems: 'center', borderWidth: 1 },
  planBtnCurrent:      { backgroundColor: 'transparent' },
  planBtnFree:         { backgroundColor: 'transparent' },
  planBtnText:         { fontSize: 14, fontFamily: FONTS.heading },
  footer:              { fontSize: 11, color: COLORS.text3, textAlign: 'center', lineHeight: 18, marginTop: SPACING.md },
});
