
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { UI_COLORS } from '../uiConstants';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
  currentApiKey: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  onClearKey,
  currentApiKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    setApiKeyInput(currentApiKey || '');
  }, [currentApiKey, isOpen]); // Reset input when modal opens/closes or key changes externally

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      onSaveKey(apiKeyInput.trim());
    }
    onClose();
  };

  const handleClear = () => {
    setApiKeyInput('');
    onClearKey();
    // onClose(); // Optionally close after clearing, or let user decide
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-popIn"
        onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-[var(--color-snow-bg-shell)] p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[var(--color-soft-pink-border)]"
        onClick={(e) => e.stopPropagation()} // Prevent overlay click from triggering inside modal
      >
        <div className="flex justify-between items-center mb-5">
            <h2 className={`text-2xl font-display text-[var(--color-header-text)] text-shadow-cute`}>
                TTS API Key
            </h2>
            <button 
                onClick={onClose} 
                className="text-2xl text-[var(--color-main-text)] hover:text-[var(--color-stimulus-highlight)] transition-colors"
                aria-label="Close modal"
            >
                &times;
            </button>
        </div>
        
        <p className="text-sm text-[var(--color-main-text)] mb-3">
          Enter your Microsoft Azure Text-to-Speech API key. This key will only be stored for your current session.
        </p>
        
        <label htmlFor="azureApiKeyInputModal" className="block text-sm font-medium text-[var(--color-main-text)] mb-1">
          API Key:
        </label>
        <input
          type="password"
          id="azureApiKeyInputModal"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Paste your Azure API Key here"
          className="w-full p-3 border border-[var(--color-soft-pink-border)] rounded-lg shadow-sm focus:ring-2 focus:ring-[var(--color-primary-to)] focus:border-[var(--color-primary-to)] text-sm bg-white text-[var(--color-main-text)] mb-1"
        />
        <p className="text-xs text-[var(--color-main-text)] opacity-80 mb-5">Region: australiaeast (fixed)</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSave} variant="primary" className="flex-1 py-3 text-base">
            Save & Enable Sound
          </Button>
          <Button onClick={handleClear} variant="secondary" className="flex-1 py-3 text-base">
            Clear Key
          </Button>
        </div>
         <Button onClick={onClose} variant="default" className="w-full mt-3 py-2.5 text-sm">
            Cancel
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyModal;
