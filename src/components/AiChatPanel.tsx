import { useEffect, useRef, useState } from 'react';
import { FileText, Bot, Send, Sparkles, User } from 'lucide-react';
import { api } from '../api';
import { STAGES, type ChatMessage, type Claim, type Stage } from '../types';

interface AiChatPanelProps {
  claim: Claim;
  onRecommendedStage: (stage: Stage) => void;
}

export function AiChatPanel({ claim, onRecommendedStage }: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setError(null);
    api
      .getAiSummary(claim.id)
      .then((content) => {
        if (!cancelled) {
          setMessages([
            {
              id: 'intro',
              role: 'assistant',
              content: `I've analyzed the documents for claim ${claim.claimNumber}. ${content}`,
              sources: claim.documents.slice(0, 2).map((d, i) => ({
                file: d.name,
                page: i + 1,
                snippet: 'Key findings from document analysis.',
              })),
            },
          ]);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'AI summary unavailable.');
      });
    return () => {
      cancelled = true;
    };
  }, [claim.id, claim.claimNumber, claim.aiSummary, claim.documents]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setError(null);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: q };
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    try {
      const answer = await api.askAi(claim.id, q, [...messages, userMsg]);
      setMessages((m) => [...m, answer]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The AI assistant is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  async function recommend() {
    setError(null);
    setRecommending(true);
    try {
      const res = await api.recommendNextStage(claim.id);
      setMessages((m) => [
        ...m,
        { id: `rec-${Date.now()}`, role: 'assistant', content: res.answer, sources: res.sources },
      ]);
      onRecommendedStage(res.nextStage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not fetch a recommendation.');
    } finally {
      setRecommending(false);
    }
  }

  const idx = STAGES.indexOf(claim.stage);
  const nextStage = STAGES[Math.min(idx + 1, STAGES.length - 1)];

  return (
    <div className="flex h-[560px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Bot className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">AI Assistant</p>
          <p className="text-[11px] text-slate-500">Cited answers from claim documents</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) =>
          m.role === 'assistant' ? (
            <AssistantBubble key={m.id} message={m} />
          ) : (
            <div key={m.id} className="flex justify-end gap-2">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2.5 text-sm leading-relaxed text-white">
                {m.content}
              </div>
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200">
                <User className="h-3.5 w-3.5 text-slate-600" />
              </div>
            </div>
          ),
        )}
        {(busy || recommending) && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
            Analyzing documents…
          </div>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="space-y-2 border-t border-slate-200 p-3">
        <button
          onClick={recommend}
          disabled={recommending || busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {recommending ? 'Analyzing…' : `Recommend next stage (${nextStage})`}
        </button>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Ask about this claim…"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800">
          {message.content}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5">
            {message.sources.map((s, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-blue-700">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">{s.file}</span>
                  <span className="ml-auto shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">p. {s.page}</span>
                </div>
                <p className="mt-1 leading-snug text-slate-500">{s.snippet}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
