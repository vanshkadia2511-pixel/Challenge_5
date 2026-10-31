/**
 * AIPlannerModal.tsx — AI Celebration Planner companion modal.
 * Matches reference 03_ai_planner.png with robot avatar, donut breakdown, and structured actions.
 */

import { useState, useEffect } from 'react';
import { useAppContext } from '../../state/context';
import { formatINR } from '../../engine/money';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BudgetCategory {
  name: string;
  pct: number;
  color: string;
  amount: number;
}

interface MessageData {
  categories?: BudgetCategory[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  data?: MessageData;
}

export function AIPlannerModal({ isOpen, onClose }: AIPlannerModalProps) {
  const { state, dispatch } = useAppContext();
  const { event, moments } = state.plan;
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'user',
      text: `I am planning a ${event.type} in ${event.city.length > 0 ? event.city : 'Ahmedabad'} for ${String(event.guests)} guests. My budget is ${formatINR(event.budgetMinor)}.`,
    },
    {
      role: 'assistant',
      text: "Great! Here's a suggested budget breakdown based on your celebration moments:",
      data: {
        categories: [
          { name: 'Venue & Catering', pct: 40, color: '#1F7A74', amount: Math.round(event.budgetMinor * 0.4) },
          { name: 'Decoration', pct: 25, color: '#E8A33D', amount: Math.round(event.budgetMinor * 0.25) },
          { name: 'Photography', pct: 15, color: '#C4476A', amount: Math.round(event.budgetMinor * 0.15) },
          { name: 'Other Expenses', pct: 20, color: '#A78BFA', amount: Math.round(event.budgetMinor * 0.2) },
        ],
      },
    },
  ]);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      {
        role: 'assistant',
        text: `I've analyzed that request. For a signature ${event.type}, focusing resources on high-impact moments creates an unforgettable celebration. You can adjust moment importance in your Deck or explore curated vendor options.`,
      },
    ]);
  };

  const handleApplyToPlan = () => {
    const costCategories = [
      { name: 'Venue & Catering Package', amountMinor: Math.round(event.budgetMinor * 0.4) },
      { name: 'Floral & Mandap Decoration', amountMinor: Math.round(event.budgetMinor * 0.25) },
      { name: 'Cinematography & Portraits', amountMinor: Math.round(event.budgetMinor * 0.15) },
    ];
    const baseId = Date.now();
    costCategories.forEach((cat, idx) => {
      dispatch({
        type: 'ADD_COST_LINE',
        costLine: {
          id: `ai-cat-${String(baseId)}-${String(idx)}`,
          label: cat.name,
          kind: 'direct',
          amountMinor: cat.amountMinor,
          locked: false,
          status: 'estimate',
          momentIds: moments.slice(0, 2).map((m) => m.id),
          usageWeights: {},
        },
      });
    });
    setApplied(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-planner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-paper rounded-2xl shadow-2xl border border-mist overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-white/80 border-b border-mist flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-saffron/20 border border-saffron/40 flex items-center justify-center p-1">
              <img src="/images/robot-avatar.svg" alt="AI Mascot" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2 id="ai-planner-title" className="font-serif text-lg font-bold text-ink flex items-center gap-1.5">
                AI Celebration Planner <span className="text-saffron">✨</span>
              </h2>
              <p className="text-xs text-ink/70">Your intelligent moments companion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { onClose(); }}
            aria-label="Close modal"
            className="p-2 text-ink/70 hover:text-ink hover:bg-mist/60 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Chat Stream */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[85%] bg-teal/15 text-ink text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm border border-teal/20">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[95%] bg-white rounded-2xl rounded-tl-sm p-4 border border-mist shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <img src="/images/robot-avatar.svg" alt="" aria-hidden="true" className="w-10 h-10 object-contain shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-teal uppercase tracking-wider">KSHAN AI</p>
                      <p className="text-sm text-ink">{msg.text}</p>
                    </div>
                  </div>

                  {/* Donut Chart and Categories if present */}
                  {msg.data?.categories != null && (
                    <div className="pt-2 border-t border-mist/60 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Donut graphic */}
                      <div className="flex justify-center">
                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                          {/* 4 segments: 40%, 25%, 15%, 20% */}
                          <circle r="38" cx="50" cy="50" fill="transparent" stroke="#1F7A74" strokeWidth="18" strokeDasharray="95.5 143.2" strokeDashoffset="0" />
                          <circle r="38" cx="50" cy="50" fill="transparent" stroke="#E8A33D" strokeWidth="18" strokeDasharray="59.7 179" strokeDashoffset="-95.5" />
                          <circle r="38" cx="50" cy="50" fill="transparent" stroke="#C4476A" strokeWidth="18" strokeDasharray="35.8 202.9" strokeDashoffset="-155.2" />
                          <circle r="38" cx="50" cy="50" fill="transparent" stroke="#A78BFA" strokeWidth="18" strokeDasharray="47.7 191" strokeDashoffset="-191" />
                        </svg>
                      </div>

                      {/* Legend */}
                      <div className="space-y-2 text-xs">
                        {msg.data.categories.map((c: BudgetCategory) => (
                          <div key={c.name} className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-ink/80">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                              {c.name}
                            </span>
                            <span className="font-semibold text-ink">{String(c.pct)}% ({formatINR(c.amount)})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.data?.categories != null && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-mist/60">
                      <button
                        type="button"
                        onClick={() => { handleApplyToPlan(); }}
                        disabled={applied}
                        className="px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {applied ? '✓ Applied to Budget' : 'Apply to Budget'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { onClose(); }}
                        className="px-3 py-1.5 rounded-lg bg-mist/60 text-ink text-xs font-medium hover:bg-mist transition-colors"
                      >
                        View Timeline
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-mist">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => { setInputMessage(e.target.value); }}
              placeholder="Ask anything about your celebration..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-mist bg-paper/50 text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
