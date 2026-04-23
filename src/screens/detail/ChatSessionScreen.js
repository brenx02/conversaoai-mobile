/**
 * ConversãoAI Mobile — ChatSessionScreen
 * Interface de chat em tempo real com especialista IA
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }           from '@expo/vector-icons';
import * as Clipboard         from 'expo-clipboard';
import * as Haptics           from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { aiAPI }              from '../../services/api';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';

const QUICK_PROMPTS = {
  COPYWRITER:           ['Analise este anúncio', 'Crie um hook poderoso', 'Reescreva minha headline', 'Técnica AIDA'],
  TRAFFIC_MANAGER:      ['Como reduzir meu CPA?', 'Melhorar CTR Meta Ads', 'Escalar campanha lucrativa', 'Estrutura de campanha'],
  SALES_STRATEGIST:     ['Criar oferta irresistível', 'Estrutura de funil', 'Como precificar meu produto?', 'Funil de lançamento'],
  FUNNEL_EXPERT:        ['Sequência de emails', 'Otimizar funil', 'Diminuir abandono', 'Automação WhatsApp'],
  LANDING_PAGE_EXPERT:  ['Analisar minha página', 'Melhorar headline', 'Estrutura de VSL page', 'Otimizar CTA'],
  CREATIVE_ANALYST:     ['Analisar meu criativo', 'Hook para vídeo', 'Variações A/B', 'Score do anúncio'],
  INFOPRODUCT_EXPERT:   ['Validar meu produto', 'Estratégia de lançamento', 'Precificação de curso', 'Como criar um PLR'],
  ECOMMERCE_EXPERT:     ['Produto vencedor', 'Descrição que vende', 'Recuperar carrinho', 'Estratégia de escala'],
};

function TypingIndicator() {
  return (
    <View style={styles.aiRow}>
      <View style={styles.aiAvatar}>
        <Text style={{ fontSize: 14 }}>🤖</Text>
      </View>
      <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 14, paddingHorizontal: 16 }]}>
        <View style={styles.typingDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, { animationDelay: `${i * 200}ms` }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Message({ item, onCopy }) {
  const isUser = item.role === 'user';

  function formatContent(text) {
    // Formata markdown básico
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim();
  }

  return (
    <View style={isUser ? styles.userRow : styles.aiRow}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={{ fontSize: 14 }}>{item.emoji || '🤖'}</Text>
        </View>
      )}
      <View style={{ flex: 1, maxWidth: '85%' }}>
        <TouchableOpacity
          style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
          onLongPress={() => onCopy(item.content)}
          activeOpacity={0.9}
        >
          <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
            {formatContent(item.content)}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.msgTime, isUser && { textAlign: 'right' }]}>
          {new Date(item.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {isUser && (
        <View style={styles.userAvatar}>
          <Text style={{ fontSize: 13 }}>B</Text>
        </View>
      )}
    </View>
  );
}

export default function ChatSessionScreen() {
  const navigation  = useNavigation();
  const route       = useRoute();
  const insets      = useSafeAreaInsets();
  const flatRef     = useRef(null);
  const inputRef    = useRef(null);

  const specialist  = route.params?.specialist || { id: 'COPYWRITER', emoji: '✍️', name: 'Copywriter Expert', color: '#6c4fff' };
  const quickBtns   = QUICK_PROMPTS[specialist.id] || QUICK_PROMPTS.COPYWRITER;

  const [messages,  setMessages]  = useState([{
    id:        'welcome',
    role:      'assistant',
    emoji:     specialist.emoji,
    content:   `Olá! Sou seu **${specialist.name}**.\n\nEstou pronto para analisar, criticar construtivamente e entregar estratégias práticas. O que vamos trabalhar hoje? 🚀`,
    createdAt: new Date(),
  }]);
  const [input,     setInput]     = useState('');
  const [typing,    setTyping]    = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Cria sessão no backend
    aiAPI.createSession({ specialist: specialist.id })
      .then(r => setSessionId(r.data?.session?.id))
      .catch(() => {});

    navigation.setOptions({
      title:       specialist.name,
      headerRight: () => (
        <TouchableOpacity onPress={clearChat} style={{ marginRight: 8 }}>
          <Ionicons name="trash-outline" size={20} color={COLORS.text2} />
        </TouchableOpacity>
      ),
    });
  }, []);

  function clearChat() {
    Alert.alert('Limpar conversa', 'Apagar todas as mensagens?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar', style: 'destructive',
        onPress: () => setMessages([{
          id: 'welcome', role: 'assistant', emoji: specialist.emoji,
          content: `Conversa reiniciada. Como posso ajudar? 🚀`,
          createdAt: new Date(),
        }]),
      },
    ]);
  }

  async function sendMessage(text = input) {
    const msg = text.trim();
    if (!msg || typing) return;

    setInput('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg = { id: Date.now().toString(), role: 'user', content: msg, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      // Monta histórico para a API (últimas 10 mensagens)
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const response = await aiAPI.chat({
        specialist: specialist.id,
        messages:   history,
        sessionId,
      });

      const aiMsg = {
        id:        Date.now().toString() + '_ai',
        role:      'assistant',
        emoji:     specialist.emoji,
        content:   response.data.content,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id:        Date.now().toString() + '_err',
        role:      'assistant',
        emoji:     '⚠️',
        content:   err.error === 'NO_CREDITS'
          ? '⚠️ Seus créditos de IA acabaram. Faça upgrade para continuar!'
          : `Erro: ${err.message || 'Tente novamente.'}`,
        createdAt: new Date(),
        isError:   true,
      };
      setMessages(prev => [...prev, errMsg]);

      if (err.upgrade) {
        Alert.alert('Créditos esgotados', 'Faça upgrade para continuar usando a IA.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver planos', onPress: () => navigation.navigate('Plans') },
        ]);
      }
    } finally {
      setTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  async function onCopy(text) {
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const renderItem = useCallback(({ item }) => (
    <Message item={item} onCopy={onCopy} />
  ), []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={typing ? <TypingIndicator /> : null}
      />

      {/* Quick prompts */}
      <View style={styles.quickRow}>
        {quickBtns.map(q => (
          <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => sendMessage(q)} activeOpacity={0.7}>
            <Text style={styles.quickBtnText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 4 }]}>
        <View style={styles.inputWrap}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Sua mensagem ou cole seu anúncio..."
            placeholderTextColor={COLORS.text3}
            multiline
            maxLength={4000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || typing) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || typing}
          >
            {typing
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={16} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageList:   { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.md },
  aiRow:         { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  userRow:       { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end', justifyContent: 'flex-end' },
  aiAvatar:      { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  userAvatar:    { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  bubble:        { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  aiBubble:      { backgroundColor: COLORS.surface, borderTopLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  userBubble:    { backgroundColor: COLORS.accent, borderTopRightRadius: 4 },
  bubbleText:    { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  userBubbleText:{ color: '#fff' },
  msgTime:       { fontSize: 10, color: COLORS.text3, marginTop: 3, marginHorizontal: 4 },
  typingDots:    { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.text3 },
  quickRow:      { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickBtn:      { backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border2 },
  quickBtnText:  { fontSize: 11, color: COLORS.text2, fontFamily: FONTS.medium },
  inputArea:     { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bg2 },
  inputWrap:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border2 },
  textInput:     { flex: 1, maxHeight: 100, color: COLORS.text, fontSize: 14, fontFamily: FONTS.body, lineHeight: 20 },
  sendBtn:       { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  sendBtnDisabled: { opacity: 0.4 },
});
