import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Modal from './Modal';
import { Copy, Send, Check, AlertCircle, Settings, ExternalLink, MessageSquare } from 'lucide-react';
import { FORMATTERS, sendWebhook } from '../../utils/discordFormat';

const WEBHOOK_KEY = 'sc_discord_webhook';

const TYPE_META = {
  build: { label: 'Build', color: 'cyan', icon: '🔧' },
  route: { label: 'Route', color: 'green', icon: '📦' },
  article: { label: 'Article', color: 'purple', icon: '📖' },
  ship: { label: 'Vaisseau', color: 'blue', icon: '🚀' },
};

const COLOR_CLASSES = {
  cyan: 'border-l-cyan-400 bg-cyan-500/5',
  green: 'border-l-emerald-400 bg-emerald-500/5',
  purple: 'border-l-purple-400 bg-purple-500/5',
  blue: 'border-l-blue-400 bg-blue-500/5',
};

const ACCENT_CLASSES = {
  cyan: 'text-cyan-400',
  green: 'text-emerald-400',
  purple: 'text-purple-400',
  blue: 'text-blue-400',
};

export default function DiscordShareModal({ isOpen, onClose, type = 'ship', data }) {
  const [webhookUrl, setWebhookUrl] = useState(() =>
    localStorage.getItem(WEBHOOK_KEY) || ''
  );
  const [showWebhookInput, setShowWebhookInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setSending(false);
      setSendResult(null);
    }
  }, [isOpen]);

  // Generate formatted message
  const message = useMemo(() => {
    if (!data || !type) return '';
    const formatter = FORMATTERS[type];
    if (!formatter) return '';
    try {
      return formatter(data);
    } catch {
      return '';
    }
  }, [type, data]);

  // Save webhook URL to localStorage
  const handleWebhookChange = useCallback((e) => {
    const url = e.target.value;
    setWebhookUrl(url);
    if (url) {
      localStorage.setItem(WEBHOOK_KEY, url);
    } else {
      localStorage.removeItem(WEBHOOK_KEY);
    }
    setSendResult(null);
  }, []);

  // Copy message to clipboard
  const handleCopy = useCallback(async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = message;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [message]);

  // Send via webhook
  const handleSend = useCallback(async () => {
    if (!webhookUrl || !message || sending) return;
    setSending(true);
    setSendResult(null);
    const result = await sendWebhook(webhookUrl, message);
    setSendResult(result);
    setSending(false);
  }, [webhookUrl, message, sending]);

  const meta = TYPE_META[type] || TYPE_META.ship;
  const colorClass = COLOR_CLASSES[meta.color];
  const accentClass = ACCENT_CLASSES[meta.color];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Partager sur Discord"
      subtitle={`Partage de ${meta.label.toLowerCase()}`}
      size="md"
      footer={
        <div className="flex items-center gap-3 w-full justify-between">
          <button
            onClick={() => setShowWebhookInput((v) => !v)}
            className="btn-ghost text-sm flex items-center gap-1.5"
            title="Configurer le webhook"
          >
            <Settings className="w-3.5 h-3.5" />
            Webhook
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary">
              Fermer
            </button>
            <button
              onClick={handleCopy}
              disabled={!message}
              className="btn-secondary flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier le message'}
            </button>
            <button
              onClick={handleSend}
              disabled={!webhookUrl || !message || sending}
              className="btn-primary flex items-center gap-2"
              title={!webhookUrl ? 'Configurez un webhook pour envoyer' : ''}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Envoi…' : 'Envoyer via Webhook'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span className={`text-lg`}>{meta.icon}</span>
          <span className={`text-sm font-medium ${accentClass}`}>{meta.label}</span>
          <MessageSquare className="w-4 h-4 text-slate-500 ml-auto" />
          <span className="text-xs text-slate-500">Aperçu Discord</span>
        </div>

        {/* Discord-style preview */}
        <div className="rounded-lg bg-[#2b2d31] p-4">
          <div className="flex items-start gap-3">
            {/* Bot avatar */}
            <div className="w-10 h-10 rounded-full bg-space-600 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🌟</span>
            </div>
            <div className="flex-1 min-w-0">
              {/* Bot name + timestamp */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-white">SC Companion</span>
                <span className="text-[10px] text-slate-500">
                  Aujourd&apos;hui à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {/* Message content — embed style */}
              <div className={`border-l-4 rounded-r-md p-3 ${colorClass}`}>
                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed break-words">
                  {message || <span className="text-slate-500 italic">Aucun contenu à afficher</span>}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Send result feedback */}
        {sendResult && (
          <div
            className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
              sendResult.ok
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {sendResult.ok ? (
              <>
                <Check className="w-4 h-4 flex-shrink-0" />
                Message envoyé avec succès !
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {sendResult.error || 'Erreur lors de l\'envoi'}
              </>
            )}
          </div>
        )}

        {/* Webhook configuration (collapsible) */}
        {showWebhookInput && (
          <div className="space-y-2 p-3 rounded-lg bg-space-800/50 border border-space-400/20">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Settings className="w-3 h-3" />
              URL du Webhook Discord
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={handleWebhookChange}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3 py-2 rounded-lg bg-space-900 border border-space-400/30 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            <p className="text-xs text-slate-500 flex items-start gap-1">
              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                Créez un webhook dans les paramètres de votre serveur Discord
                (Paramètres du salon → Intégrations → Webhooks).
                L'URL est sauvegardée localement.
              </span>
            </p>
          </div>
        )}

        {/* Raw markdown (copyable) */}
        <details className="group">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
            Voir le texte brut
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-space-900 border border-space-400/20 max-h-48 overflow-y-auto scroll-container">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono break-words select-all">
              {message}
            </pre>
          </div>
        </details>
      </div>
    </Modal>
  );
}
