/**
 * ConversãoAI Mobile — CopyScreen
 * Gerador de copy + navegação para outras ferramentas
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
import { useNavigation }      from '@react-navigation/native';
import { aiAPI }              from '../services/api';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

const COPY_TYPES = [
  { id: 'anuncio',   icon: '📢', label: 'Anúncio',   desc: 'Meta / Google / TikTok' },
  { id: 'email',     icon: '📧', label: 'Email',      desc: 'Marketing de vendas' },
  { id: 'vsl',       icon: '🎬', label: 'VSL',        desc: 'Video Sales Letter' },
  { id: 'whatsapp',  icon: '💬', label: 'WhatsApp',   desc: 'Mensagem de vendas' },
  { id: 'pagina',    icon: '🖥️', label: 'Página',     desc: 'Estrutura completa' },
  { id: 'script',    icon: '📹', label: 'Script',     desc: 'Reels / TikTok / Shorts' },
  { id: 'headline',  icon: '💥', label: 'Headlines',  desc: '10 opções com fórmulas' },
  { id: 'oferta',    icon: '💎', label: 'Oferta',     desc: 'Stack irresistível' },
];

const TONES = ['Urgente e direto', 'Inspiracional', 'Empático', 'Autoritário', 'Descontraído'];

const OTHER_TOOLS = [
  { icon: '🎨', label: 'Criativo',  screen: 'Creative',    color: '#ffb830' },
  { icon: '📄', label: 'Página',    screen: 'LandingPage', color: '#4f9fff' },
  { icon: '🚀', label: 'Campanha',  screen: 'Campaign',    color: '#ff5fa0' },
  { icon: '💡', label: 'Validar',   screen: 'Validate',    color: '#0fd4b4' },
  { icon: '📈', label: 'Tráfego',   screen: 'Traffic',     color: '#ff7a40' },
  { icon: '⚖️', label: 'A/B Test',  screen: 'ChatSession', color: '#9b7dff' },
];

export default function CopyScreen() {
  const navigation  = useNavigation();
  const insets      = useSafeAreaInsets();

  const [activeType, setActiveType] = useState('anuncio');
  const [product,    setProduct]    = useState('');
  const [audience,   setAudience]   = useState('');
  const [benefit,    setBenefit]    = useState('');
  const [objection,  setObjection]  = useState('');
  const [toneIdx,    setToneIdx]    = useState(0);
  const [result,     setResult]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [copied,     setCopied]     = useState(false);

  async function generate() {
    if (!product.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o produto ou serviço.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const res = await aiAPI.generateCopy({
        copyType:   activeType,
        product:    product.trim(),
        audience:   audience.trim(),
        benefit:    benefit.trim(),
        tone:       TONES[toneIdx],
        objection:  objection.trim() || 'falta de tempo',
      });
      setResult(res.data.copy.content);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Tente novamente.');
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Title */}
        <Text style={styles.title}>✍️ Gerar Copy</Text>
        <Text style={styles.sub}>Escolha o formato e gere copy de alta conversão</Text>

        {/* Tipo de copy */}
        <Text style={styles.sectionLabel}>Formato</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesRow}>
          {COPY_TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeCard, activeType === t.id && styles.typeCardActive]}
              onPress={() => setActiveType(t.id)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={[styles.typeLabel, activeType === t.id && styles.typeLabelActive]}>{t.label}</Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Produto / Serviço *</Text>
            <TextInput
              style={styles.input}
              value={product}
              onChangeText={setProduct}
              placeholder="Ex: Curso de tráfego pago"
              placeholderTextColor={COLORS.text3}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Público-alvo</Text>
            <TextInput
              style={styles.input}
              value={audience}
              onChangeText={setAudience}
              placeholder="Ex: Empreendedores iniciantes 25-40"
              placeholderTextColor={COLORS.text3}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Principal benefício / resultado</Text>
            <TextInput
              style={styles.input}
              value={benefit}
              onChangeText={setBenefit}
              placeholder="Ex: Dobrar faturamento em 60 dias"
              placeholderTextColor={COLORS.text3}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Objeção a quebrar</Text>
            <TextInput
              style={styles.input}
              value={objection}
              onChangeText={setObjection}
              placeholder="Ex: Já tentei antes, não tenho tempo..."
              placeholderTextColor={COLORS.text3}
            />
          </View>

          {/* Tom */}
          <View style={styles.field}>
            <Text style={styles.label}>Tom de voz</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {TONES.map((t, i) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toneBtn, toneIdx === i && styles.toneBtnActive]}
                    onPress={() => setToneIdx(i)}
                  >
                    <Text style={[styles.toneTxt, toneIdx === i && styles.toneTxtActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.genBtn, loading && styles.genBtnDisabled]}
            onPress={generate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <><Text style={{ fontSize: 16 }}>✨</Text><Text style={styles.genBtnText}>Gerar Copy com IA</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>🔥 Copy gerada</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.resultBtn} onPress={copyResult}>
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? COLORS.green : COLORS.text2} />
                  <Text style={[styles.resultBtnText, copied && { color: COLORS.green }]}>{copied ? 'Copiado!' : 'Copiar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resultBtn} onPress={generate}>
                  <Ionicons name="refresh" size={16} color={COLORS.text2} />
                  <Text style={styles.resultBtnText}>Gerar nova</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.resultText} selectable>{result}</Text>
          </View>
        ) : null}

        {/* Outras ferramentas */}
        <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>Outras ferramentas</Text>
        <View style={styles.toolsGrid}>
          {OTHER_TOOLS.map(t => (
            <TouchableOpacity
              key={t.screen}
              style={[styles.toolBtn, { borderColor: t.color + '44' }]}
              onPress={() => navigation.navigate(t.screen)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={[styles.toolBtnLabel, { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  content:        { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 32 },
  title:          { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: 4 },
  sub:            { fontSize: 13, color: COLORS.text2, marginBottom: SPACING.xl },
  sectionLabel:   { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  typesRow:       { marginBottom: SPACING.xl, marginHorizontal: -SPACING.xl, paddingHorizontal: SPACING.xl },
  typeCard:       { width: 88, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, marginRight: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  typeLabel:      { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.text2, marginTop: 4 },
  typeLabelActive:{ color: COLORS.accent2 },
  typeDesc:       { fontSize: 9, color: COLORS.text3, textAlign: 'center', marginTop: 2 },
  form:           { gap: SPACING.md, marginBottom: SPACING.lg },
  field:          { gap: 6 },
  label:          { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.8 },
  input:          { backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border2, color: COLORS.text, fontSize: 13.5, paddingHorizontal: 13, height: 46, fontFamily: FONTS.body },
  toneBtn:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border2 },
  toneBtnActive:  { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  toneTxt:        { fontSize: 12, color: COLORS.text2, fontFamily: FONTS.medium },
  toneTxtActive:  { color: COLORS.accent2 },
  genBtn:         { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: SPACING.sm },
  genBtnDisabled: { opacity: 0.6 },
  genBtnText:     { fontSize: 15, fontFamily: FONTS.heading, color: '#fff' },
  resultCard:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: SPACING.lg },
  resultHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface2 },
  resultTitle:    { fontSize: 13.5, fontFamily: FONTS.heading, color: COLORS.text },
  resultBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  resultBtnText:  { fontSize: 12, color: COLORS.text2 },
  resultText:     { fontSize: 13.5, color: COLORS.text, lineHeight: 22, padding: SPACING.md },
  toolsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  toolBtn:        { flex: 1, minWidth: '30%', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1 },
  toolBtnLabel:   { fontSize: 11.5, fontFamily: FONTS.medium },
});
