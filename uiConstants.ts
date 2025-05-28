
// UI Theme and Color Constants

export const UI_COLORS = {
  // Base & Backgrounds
  lavenderBlushBg: '#FEF0F5', 
  snowBgShell: 'rgba(255, 250, 250, 0.88)', 
  softPinkBorder: 'rgba(255, 192, 203, 0.5)',
  shellShadowDiffuse: 'rgba(220, 160, 190, 0.25)',
  shellShadowAmbient: 'rgba(210, 130, 160, 0.1)',

  // Primary Interactive Elements (Brighter, Softer Pinks)
  primaryInteractivePinkFrom: '#FFC0CB', // Pink
  primaryInteractivePinkTo: '#FFB0D0',   // Lighter, softer pink
  primaryInteractiveText: '#9D5C75', // Softer deep pink/purple

  // Secondary Buttons (Gentle & Cute)
  secondaryButtonFrom: '#FFF0F5', // LavenderBlush (almost white pink)
  secondaryButtonTo: '#FFE4E9',   // Very light misty rose
  secondaryButtonText: '#B66085', // Clearer pink text for secondary

  // Back/Action Buttons (Soft & Distinct)
  backButtonFrom: '#F0E6FF', // Softer Lavender
  backButtonTo: '#E0D6EF',   // Softer Thistle
  backButtonText: '#7A678C', // Kept for readability
  
  // Stimulus & Highlight Text
  stimulusDisplayPink: '#F06292', // Vibrant, cheerful pink
  
  // General Text Colors
  mainTextColor: '#A87A99',      // Softer lavender-pink for body
  headerTextColor: '#C77B9F', // Softer, friendly header pink

  // Feedback Colors (Updated for softer backgrounds)
  feedbackCorrectBgFrom: '#E0F2F1', 
  feedbackCorrectBgTo: '#B2DFDB',
  feedbackCorrectText: '#00796B', 

  feedbackIncorrectBgFrom: '#FFEBEE', 
  feedbackIncorrectBgTo: '#FFCDD2',
  feedbackIncorrectText: '#D32F2F', 

  // Petal & FX
  petalFill: 'rgba(255, 182, 193, 0.75)', 
  petalHighlight: 'rgba(255, 220, 230, 0.95)', 
  petalGlow: 'rgba(240, 98, 146, 0.35)', 
  petalSpecialFill: '#F06292', // stimulusDisplayPink for special petals

  // Disabled State
  disabledBg: '#EDE7F6', 
  disabledText: '#B0A8C2', 
  disabledBorder: '#D1C4E9',
};

export const UI_THEME = {
  primaryColor: UI_COLORS.primaryInteractivePinkFrom, 
  secondaryColor: UI_COLORS.secondaryButtonFrom, 
  backgroundColor: `bg-[var(--color-lavender-blush-bg)]`, 
  textColor: `text-[var(--color-main-text)]`,
  cardColor: `bg-[var(--color-snow-bg-shell)]`, 
  fontDisplay: 'font-display',
  fontBody: 'font-sans',
  fontKana: 'font-kana',
  
  // Button base styles - updated for "pill" shape and padding
  buttonBase: `py-3.5 px-7 rounded-full shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 btn-interactive font-semibold text-base md:text-lg`,
  
  buttonPrimary: `text-[var(--color-primary-text)] focus:ring-[var(--color-primary-to)]`,
  buttonSecondary: `text-[var(--color-secondary-text)] focus:ring-[var(--color-secondary-to)]`,
  buttonOption: `text-[var(--color-secondary-text)] border border-[var(--color-soft-pink-border)] focus:ring-[var(--color-primary-to)]`,
};
