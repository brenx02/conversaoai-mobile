/**
 * ConversãoAI Mobile — CreativeScreen
 * Análise de criativos com score completo
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';
import * as Clipboard         from 'expo-clipboard';
import * as Haptics           from 'expo-haptics';
import { aiAPI }              from '../services/api';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

const TYPES = [
  'Anúncio Meta Ads', 'Anúncio Google Ads', 'Anúncio TikTok Ads',
  'Headline de página', 'Roteiro VSL', 'Copy WhatsApp', 'Email marketing',
];

const GOALS = ['Gerar cliques (CTR)', 'Capturar leads', 'Venda direta', 'Engajamento'];

function ScoreBar({ label, value, color }) {
  return (
    <View style={sStyles.scoreRow}>
      <Text style={sStyles.scoreLabel}>{label}</Text>
      <View style={sStyles.barBg}>
        <View style={[sStyles.barFill, { width: `${value * 10}%`, backgroundColor: color }]} />
      </View>
      <Text style={[sStyles.scoreVal, { color }]}>{value}</Text>
    </View>
  );
}

function ResultItem({ icon, text, type }) {
  const colors = { pos: { bg: COLORS.greenBg, text: '#7dfab5' }, neg: { bg: COLORS.redBg, text: '#ffaaaa' }, sug: { bg: COLORS.blueBg, text: '#a0c8ff' } };
  const c = colors[type] || colors.sug;
  return (
    <View style={[sStyles.resultItem, { backgroundColor: c.bg }]}>
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={[sStyles.resultItemText, { color: c.text }]}>{text}</Text>
    </View>
  );
}

export default function CreativeScreen() {
  const insets  = useSafeAreaInsets();

  const [typeIdx,   setTypeIdx]   = useState(0);
  const [goalIdx,   setGoalIdx]   = useState(0);
  const [product,   setProduct]   = useState('');
  const [text,      setText]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [copied,    setCopied]    = useState('');

  async function analyze() {
    if (text.trim().length < 10) {
      Alert.alert('Campo obrigatório', 'Cole seu criativo para analisar.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.analyzeCreative({
        type:    TYPES[typeIdx],
        text:    text.trim(),
        product: product.trim(),
        goal:    GOALS[goalIdx],
      });
      setResult(res.data.analysis);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function copyText(t, key) {
    await Clipboard.setStringAsync(t);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  const scoreColor = result
    ? result.nota_geral >= 8 ? COLORS.green : result.nota_geral >= 6 ? COLORS.amber : COLORS.red
    : COLORS.text;

  return (
    <View style={[sStyles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sStyles.content}>
        <Text style={sStyles.title}>🎨 Analisador de Criativos</Text>
        <Text style={sStyles.sub}>Cole seu texto e receba nota + diagnóstico + versão melhorada</Text>

        {/* Tipo */}
        <Text style={sStyles.fieldLabel}>Tipo de criativo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.xl, paddingHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
          {TYPES.map((t, i) => (
            <TouchableOpacity key={t} style={[sStyles.chip, typeIdx === i && sStyles.chipActive]} onPress={() => setTypeIdx(i)}>
              <Text style={[sStyles.chipText, typeIdx === i && sStyles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Produto */}
        <Text style={sStyles.fieldLabel}>Produto / Nicho</Text>
        <TextInput style={[sStyles.input, { marginBottom: SPACING.md }]} value={product} onChangeText={setProduct}
          placeholder="Ex: Curso de tráfego, E-commerce de roupas..." placeholderTextColor={COLORS.text3} />

        {/* Criativo */}
        <Text style={sStyles.fieldLabel}>Seu criativo *</Text>
        <TextInput style={[sStyles.input, sStyles.textarea]} value={text} onChangeText={setText}
          placeholder="Cole aqui seu anúncio, headline, roteiro ou copy completa..."
          placeholderTextColor={COLORS.text3} multiline maxLength={4000} />
        <Text style={sStyles.charCount}>{text.length}/4000</Text>

        {/* Objetivo */}
        <Text style={sStyles.fieldLabel}>Objetivo</Text>
        <View style={sStyles.goalRow}>
          {GOALS.map((g, i) => (
            <TouchableOpacity key={g} style={[sStyles.goalBtn, goalIdx === i && sStyles.goalBtnActive]} onPress={() => setGoalIdx(i)}>
              <Text style={[sStyles.goalText, goalIdx === i && sStyles.goalTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão */}
        <TouchableOpacity style={[sStyles.btn, loading && sStyles.btnDisabled]} onPress={analyze} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <><Text style={{ fontSize: 16 }}>🔍</Text><Text style={sStyles.btnText}>Analisar com IA</Text></>
          }
        </TouchableOpacity>

        {/* Resultado */}
        {result && (
          <View style={{ marginTop: SPACING.xl }}>

            {/* Score geral */}
            <View style={sStyles.scoreCard}>
              <View style={sStyles.scoreMain}>
                <Text style={[sStyles.scoreNum, { color: scoreColor }]}>{result.nota_geral}</Text>
                <View>
                  <Text style={sStyles.scoreDenom}>/10</Text>
                  <View style={[sStyles.probBadge, {
                    backgroundColor: result.probabilidade_conversao === 'alta' ? COLORS.greenBg : result.probabilidade_conversao === 'média' ? COLORS.amberBg : COLORS.redBg,
                  }]}>
                    <Text style={{ fontSize: 10, color: result.probabilidade_conversao === 'alta' ? COLORS.green : result.probabilidade_conversao === 'média' ? COLORS.amber : COLORS.red, fontFamily: FONTS.medium }}>
                      Conversão {result.probabilidade_conversao}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={sStyles.scoreBars}>
                <ScoreBar label="Conversão" value={result.nota_conversao} color={COLORS.green}   />
                <ScoreBar label="Clareza"   value={result.nota_clareza}   color={COLORS.accent2} />
                <ScoreBar label="Persuasão" value={result.nota_persuasao} color={COLORS.amber}   />
                <ScoreBar label="Hook"      value={result.nota_hook}      color={COLORS.pink}    />
              </View>
            </View>

            {/* Pontos */}
            {result.pontos_fortes?.length > 0 && (
              <View style={sStyles.resultSection}>
                <Text style={[sStyles.resultSectionTitle, { color: COLORS.green }]}>✅ Pontos fortes</Text>
                {result.pontos_fortes.map((p, i) => <ResultItem key={i} icon="✅" text={p} type="pos" />)}
              </View>
            )}
            {result.pontos_fracos?.length > 0 && (
              <View style={sStyles.resultSection}>
                <Text style={[sStyles.resultSectionTitle, { color: COLORS.red }]}>❌ Pontos fracos</Text>
                {result.pontos_fracos.map((p, i) => <ResultItem key={i} icon="❌" text={p} type="neg" />)}
              </View>
            )}
            {result.sugestoes?.length > 0 && (
              <View style={sStyles.resultSection}>
                <Text style={[sStyles.resultSectionTitle, { color: COLORS.blue }]}>💡 Sugestões</Text>
                {result.sugestoes.map((p, i) => <ResultItem key={i} icon="💡" text={p} type="sug" />)}
              </View>
            )}

            {/* Versão otimizada */}
            {result.versao_otimizada && (
              <View style={sStyles.optimizedCard}>
                <View style={sStyles.optimizedHeader}>
                  <Text style={sStyles.optimizedTitle}>🔥 Versão otimizada</Text>
                  <TouchableOpacity onPress={() => copyText(result.versao_otimizada, 'opt')}>
                    <Ionicons name={copied === 'opt' ? 'checkmark' : 'copy-outline'} size={18} color={copied === 'opt' ? COLORS.green : COLORS.text2} />
                  </TouchableOpacity>
                </View>
                <Text style={sStyles.optimizedText} selectable>{result.versao_otimizada}</Text>
              </View>
            )}

            {/* Variação A/B */}
            {result.variacao_ab && (
              <View style={[sStyles.optimizedCard, { borderColor: COLORS.pink + '44' }]}>
                <View style={sStyles.optimizedHeader}>
                  <Text style={[sStyles.optimizedTitle, { color: COLORS.pink }]}>⚖️ Variação A/B</Text>
                  <TouchableOpacity onPress={() => copyText(result.variacao_ab, 'ab')}>
                    <Ionicons name={copied === 'ab' ? 'checkmark' : 'copy-outline'} size={18} color={copied === 'ab' ? COLORS.green : COLORS.text2} />
                  </TouchableOpacity>
                </View>
                <Text style={sStyles.optimizedText} selectable>{result.variacao_ab}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const sStyles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.bg },
  content:            { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 32 },
  title:              { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: 4 },
  sub:                { fontSize: 13, color: COLORS.text2, marginBottom: SPACING.xl },
  fieldLabel:         { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  chip:               { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  chipActive:         { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  chipText:           { fontSize: 12, color: COLORS.text2, fontFamily: FONTS.medium },
  chipTextActive:     { color: COLORS.accent2 },
  input:              { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border2, color: COLORS.text, fontSize: 14, paddingHorizontal: 13, height: 46, fontFamily: FONTS.body },
  textarea:           { height: 140, paddingTop: 12, textAlignVertical: 'top', marginBottom: 4 },
  charCount:          { fontSize: 10, color: COLORS.text3, textAlign: 'right', marginBottom: SPACING.md },
  goalRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: SPACING.lg },
  goalBtn:            { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  goalBtnActive:      { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  goalText:           { fontSize: 12, color: COLORS.text2, fontFamily: FONTS.medium },
  goalTextActive:     { color: COLORS.accent2 },
  btn:                { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnDisabled:        { opacity: 0.6 },
  btnText:            { fontSize: 15, fontFamily: FONTS.heading, color: '#fff' },
  scoreCard:          { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: SPACING.md },
  scoreMain:          { flexDirection: 'row', alignItems: 'center', gap: 14, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface2 },
  scoreNum:           { fontSize: 54, fontFamily: FONTS.heading, lineHeight: 58 },
  scoreDenom:         { fontSize: 14, color: COLORS.text2 },
  probBadge:          { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: 5 },
  scoreBars:          { padding: SPACING.md, gap: 9 },
  scoreRow:           { flexDirection: 'row', alignItems: 'center', gap: 9 },
  scoreLabel:         { fontSize: 11, color: COLORS.text2, width: 70 },
  barBg:              { flex: 1, height: 5, backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden' },
  barFill:            { height: 5, borderRadius: 3 },
  scoreVal:           { fontSize: 12, fontFamily: FONTS.medium, width: 22, textAlign: 'right' },
  resultSection:      { marginBottom: SPACING.md },
  resultSectionTitle: { fontSize: 11, fontFamily: FONTS.medium, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 },
  resultItem:         { flexDirection: 'row', gap: 8, padding: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: 4, alignItems: 'flex-start' },
  resultItemText:     { fontSize: 12.5, flex: 1, lineHeight: 18 },
  optimizedCard:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: SPACING.md },
  optimizedHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface2 },
  optimizedTitle:     { fontSize: 13.5, fontFamily: FONTS.heading, color: COLORS.text },
  optimizedText:      { fontSize: 13.5, color: COLORS.text, lineHeight: 22, padding: SPACING.md },
});
