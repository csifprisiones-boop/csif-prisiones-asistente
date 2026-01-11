import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, Attachment } from '../types';
import { sendMessageToGemini, fileToBase64, embedText } from '../services/geminiService';
import { supabase } from '../services/supabase';
import { PERMITS_DATA } from '../constants/permits';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hola, compañero/a. 👋 Soy tu asistente de CSIF. ¿En qué puedo ayudarte hoy? Puedo analizar documentos (imágenes) o videos de seguridad.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [useLocalContext, setUseLocalContext] = useState(false);
  const [showPermitSelector, setShowPermitSelector] = useState(false);
  const [userCategory, setUserCategory] = useState<'funcionario' | 'laboral'>('funcionario');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const messageText = overrideText || input;
    if ((!messageText.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    let systemContextOverride: string | undefined;

    try {
      // RAG Logic
      if (useLocalContext && input.trim()) {
        const embedding = await embedText(input);
        if (embedding) {
          const { data: chunks } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5
          });

          if (chunks && chunks.length > 0) {
            const contextText = chunks.map((c: any) => c.content).join('\n\n');
            systemContextOverride = `Responde ÚNICAMENTE basándote en el siguiente contexto extraído de la documentación oficial. Si la respuesta no está en el contexto, di "No tengo información en la documentación oficial para responder a eso". NO inventes información.\n\nCONTEXTO:\n${contextText}`;
          } else {
            systemContextOverride = "El usuario quiere consultar la documentación oficial, pero no se ha encontrado información relevante en la base de datos para esta consulta. Responde educadamente que no has encontrado esa información en los documentos subidos.";
          }
        }
      }

      // Specialized Permisos Context
      if (messageText.includes('SOLICITAR PERMISO:')) {
        systemContextOverride = "Eres un experto en normativa de la Administración General del Estado (AGE), específicamente en el TREBEP (para funcionarios) y el IV Convenio Único (para personal laboral). Responde con precisión técnica basándote SOLO en fuentes oficiales. Explica los requisitos, duración y parentescos si aplica.";
      }

      const responseText = await sendMessageToGemini(messages, userMessage.text, userMessage.attachments, systemContextOverride);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Hubo un error al procesar tu solicitud. Inténtalo de nuevo.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) return;

      try {
        const base64 = await fileToBase64(file);
        const newAttachment: Attachment = {
          type: isVideo ? 'video' : 'image',
          url: URL.createObjectURL(file),
          base64: base64,
          mimeType: file.type
        };
        setAttachments(prev => [...prev, newAttachment]);
      } catch (error) {
        console.error("Error reading file", error);
        alert("Error al cargar el archivo.");
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen flex flex-col overflow-hidden max-w-md mx-auto relative">
      <header className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 pb-3 shrink-0 shadow-sm z-10 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-slate-900 dark:text-white text-base font-bold leading-tight">Asistente CSIF</h2>
              <div className="flex items-center gap-1">
                <span className="text-green-600 dark:text-green-400 text-xs font-medium">En línea</span>
                <span className="text-slate-400 text-[10px]">• Motor IA Híbrido</span>
              </div>
            </div>
          </div>
          {/* RAG Toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase transition-colors ${useLocalContext ? 'text-primary' : 'text-gray-400'}`}>
              {useLocalContext ? 'Solo Docs' : 'General'}
            </span>
            <button
              onClick={() => setUseLocalContext(!useLocalContext)}
              className={`relative w-10 h-5 rounded-full transition-colors ${useLocalContext ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 size-4 bg-white rounded-full shadow-sm transition-transform ${useLocalContext ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto p-4 gap-4 bg-background-light dark:bg-background-dark scroll-smooth">
        <div className="flex justify-center py-2">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">Hoy</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'self-end justify-end' : 'self-start'} max-w-[85%] sm:max-w-[75%]`}>
            {msg.role === 'model' && (
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-8 shrink-0 mb-1 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqcfZTFQSvM07THMf_N2nW2NEAbFqlVj18id6-KLT3uecujc4hYFzOzr0Y-vHLNRJoK9enWzKhdNZio-1_gzo-rqGevqGRXpJK4a-7Q9MggNYohJeerLT0EAOLdrlLwgRe-vgGt4G6BYzyo7T5yO9wnKgDVoBUb4y-yFdkj552TR--p08GusciPBZUtxJy6YqJKn-pjn2EZ5ufIEC8IsUo0d4SsdGXwnnYkfIAQVPKCP8MVUmCOTt84VydqYyrzDBAmWBIpuxRgdHk")' }}></div>
            )}
            <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                ? 'bg-primary text-white rounded-br-none'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                }`}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((att, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-white/20 w-32 h-32 bg-black/10">
                        {att.type === 'image' ? (
                          <img src={att.url} alt="attachment" className="w-full h-full object-cover" />
                        ) : (
                          <video src={att.url} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mx-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-3 self-start max-w-[85%]">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-8 shrink-0 mb-1 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqcfZTFQSvM07THMf_N2nW2NEAbFqlVj18id6-KLT3uecujc4hYFzOzr0Y-vHLNRJoK9enWzKhdNZio-1_gzo-rqGevqGRXpJK4a-7Q9MggNYohJeerLT0EAOLdrlLwgRe-vgGt4G6BYzyo7T5yO9wnKgDVoBUb4y-yFdkj552TR--p08GusciPBZUtxJy6YqJKn-pjn2EZ5ufIEC8IsUo0d4SsdGXwnnYkfIAQVPKCP8MVUmCOTt84VydqYyrzDBAmWBIpuxRgdHk")' }}></div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Attachments Preview Area */}
      {attachments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-2 flex gap-2 overflow-x-auto">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              {att.type === 'image' ? (
                <img src={att.url} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <video src={att.url} className="w-full h-full object-cover" muted />
              )}
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <footer className="flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 pb-safe">
        <div className="w-full overflow-x-auto no-scrollbar py-3 px-4 flex gap-2 border-b border-slate-50 dark:border-slate-800/50">
          <button
            onClick={() => setShowPermitSelector(!showPermitSelector)}
            className={`shrink-0 px-4 py-1.5 rounded-full flex items-center gap-2 transition-all border ${showPermitSelector ? 'bg-primary text-white border-primary shadow-md' : 'bg-primary/10 text-primary border-transparent hover:bg-primary/20 hover:border-primary/30'}`}
          >
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            <span className="text-sm font-bold uppercase tracking-tight">Solicitar permiso</span>
          </button>

          <button
            onClick={() => {
              const text = "RECURSO DENEGACIÓN PERMISO: Por favor, redacta un modelo de recurso de alzada ante la denegación de un permiso solicitado, para presentarlo en la Oficina de Personal de mi centro penitenciario.";
              handleSend(text);
            }}
            className="shrink-0 px-4 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-tight transition-colors border border-transparent hover:border-red-500/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            RECURSO
          </button>

          {['Normativa vigente', 'Bajas médicas'].map((txt) => (
            <button
              key={txt}
              onClick={() => setInput(txt)}
              className="shrink-0 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors border border-transparent"
            >
              {txt}
            </button>
          ))}
        </div>

        {/* Permit Selector Modal-like Panel */}
        {showPermitSelector && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <div className="flex gap-2 mb-4 bg-white dark:bg-slate-900 p-1 rounded-xl w-fit border border-slate-100 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setUserCategory('funcionario')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${userCategory === 'funcionario' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Funcionario
              </button>
              <button
                onClick={() => setUserCategory('laboral')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${userCategory === 'laboral' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Laboral
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
              {PERMITS_DATA[userCategory].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const text = `SOLICITAR PERMISO: Soy personal ${userCategory.toUpperCase()} y quiero solicitar el permiso de "${p.label}". Explícame los requisitos y duración basándote en fuentes oficiales.`;
                    handleSend(text);
                    setShowPermitSelector(false);
                  }}
                  className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-left border border-slate-100 dark:border-slate-800 hover:border-primary transition-all shadow-sm flex flex-col gap-1 group"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{p.label}</span>
                  <span className="text-[11px] text-slate-500 italic line-clamp-1">{p.detail}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="p-3 sm:p-4 flex items-end gap-2 pb-6 sm:pb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            title="Adjuntar imagen o video"
          >
            <span className="material-symbols-outlined text-[28px]">add_circle</span>
          </button>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center min-h-[44px] px-4 py-2 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <input
              className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-[15px] focus:outline-none"
              placeholder="Escribe tu consulta..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className={`size-11 flex items-center justify-center rounded-full shadow-md shrink-0 transition-all ${(!input.trim() && attachments.length === 0) || isLoading
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark text-white'
              }`}
          >
            <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;