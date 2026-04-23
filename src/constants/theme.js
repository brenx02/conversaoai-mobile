/**
 * ConversãoAI Mobile — Design Tokens
 */

export const COLORS = {
  // Backgrounds
  bg:      '#08080f',
  bg2:     '#0e0e1a',
  bg3:     '#131320',
  surface: '#1a1a2a',
  surface2:'#20203a',

  // Borders
  border:  'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.11)',
  border3: 'rgba(255,255,255,0.18)',

  // Text
  text:    '#ededf5',
  text2:   '#8888a8',
  text3:   '#44445a',

  // Brand
  accent:  '#6c4fff',
  accent2: '#9b7dff',

  // Semantic
  green:    '#1fd97a',
  greenBg:  'rgba(31,217,122,0.1)',
  amber:    '#ffb830',
  amberBg:  'rgba(255,184,48,0.1)',
  red:      '#ff4f4f',
  redBg:    'rgba(255,79,79,0.1)',
  blue:     '#4f9fff',
  blueBg:   'rgba(79,159,255,0.1)',
  pink:     '#ff5fa0',
  teal:     '#0fd4b4',
};

export const FONTS = {
  heading: 'Syne-Bold',
  body:    'DMSans-Regular',
  medium:  'DMSans-Medium',
  mono:    'SpaceMono-Regular',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  20,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius:  4,
    elevation:     3,
  },
  medium: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  8,
    elevation:     6,
  },
  glow: {
    shadowColor:   '#6c4fff',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  12,
    elevation:     8,
  },
};

export const GRADIENTS = {
  accent:  ['#6c4fff', '#9340e8'],
  success: ['#1fd97a', '#0aaa5a'],
  warning: ['#ffb830', '#ff7a40'],
  danger:  ['#ff4f4f', '#cc0000'],
  teal:    ['#0fd4b4', '#0aaa8a'],
};
