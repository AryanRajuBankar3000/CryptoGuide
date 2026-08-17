'use client'

import { useRef, useState } from 'react'
import { Send, Sparkles, Bot } from 'lucide-react'
import { answer } from '@/lib/crypto/assistant'
import { ASSISTANT_PROMPTS } from '@/lib/crypto/data'
import { SectionHeader } from '../ui/primitives'



export function Assistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const idRef = useRef(0)
  const scrollRef = useRef(null)

  function ask(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg = { id: ++idRef.current, role: 'user', text: trimmed }
    const botMsg = { id: ++idRef.current, role: 'assistant', reply: answer(trimmed) }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      ask(input)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <SectionHeader
        eyebrow="Guidance"
        title="Cryptography assistant"
        description="Ask about automotive cryptographic controls and post-quantum migration. Answers reference the built-in knowledge base and are guidance only."
      />

      <div
        ref={scrollRef}
        className="mt-8 min-h-[340px] max-h-[52vh] space-y-5 overflow-y-auto rounded-xl border border-border bg-card/40 p-5 sm:p-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-card">
              <Bot className="h-6 w-6 text-bright" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Ask a question about automotive cryptography, or pick a suggested prompt to get started.
            </p>
          </div>
        ) : (
          messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-card">
                  <Sparkles className="h-4 w-4 text-bright" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card-2 px-4 py-3">
                  <p className="text-sm leading-relaxed text-foreground">{m.reply.text}</p>
                  {m.reply.refs ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {m.reply.refs.map((r) => (
                        <li
                          key={r.label}
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          <span className="text-muted-foreground/70">{r.label}: </span>
                          <span className="text-foreground">{r.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ),
          )
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ASSISTANT_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => ask(p)}
            className="rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-3 rounded-xl border border-border bg-card/50 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask about crypto for a security objective…"
          aria-label="Ask the cryptography assistant"
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={() => ask(input)}
          disabled={!input.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-bright disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
