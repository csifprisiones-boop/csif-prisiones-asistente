import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { supabase } from '../services/supabase';
import { embedText } from '../services/geminiService';
import { useAuth } from '../components/AuthProvider';

interface Document {
    id: string;
    title: string;
    created_at: string;
}

const DocumentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [viewContent, setViewContent] = useState<string | null>(null);
    const [isViewing, setIsViewing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchDocuments();
            fetchUserRole();
        }
    }, [user]);

    const fetchUserRole = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (data?.role === 'admin') {
            setIsAdmin(true);
        }
    };

    const fetchDocuments = async () => {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching docs:', error);
        else setDocuments(data || []);
    };

    const handleSaveDocument = async () => {
        if (!newTitle.trim() || !newContent.trim() || !user) return;
        setIsProcessing(true);

        try {
            // 2. Generate Embedding (re-generamos siempre en edición para mantener coherencia)
            const embedding = await embedText(newContent);
            if (!embedding) throw new Error("Failed to generate embedding");

            if (editingDocId) {
                // UPDATE MODE
                // 1. Update Document Title
                const { error: docError } = await supabase
                    .from('documents')
                    .update({ title: newTitle })
                    .eq('id', editingDocId);

                if (docError) throw docError;

                // 2. Update/Upsert Section
                // assumes single section for now
                const { data: existingSections } = await supabase
                    .from('document_sections')
                    .select('id')
                    .eq('document_id', editingDocId);

                if (existingSections && existingSections.length > 0) {
                    const { error: sectionError } = await supabase
                        .from('document_sections')
                        .update({ content: newContent, embedding: embedding })
                        .eq('id', existingSections[0].id);
                    if (sectionError) throw sectionError;
                } else {
                    const { error: sectionError } = await supabase
                        .from('document_sections')
                        .insert({
                            document_id: editingDocId,
                            content: newContent,
                            embedding: embedding
                        });
                    if (sectionError) throw sectionError;
                }

                alert('Documento actualizado correctamente.');
            } else {
                // CREATE MODE
                // 1. Create Document Entry
                const { data: docData, error: docError } = await supabase
                    .from('documents')
                    .insert({ title: newTitle, user_id: user.id })
                    .select()
                    .single();

                if (docError) throw docError;

                // 2. Save Section
                const { error: sectionError } = await supabase
                    .from('document_sections')
                    .insert({
                        document_id: docData.id,
                        content: newContent,
                        embedding: embedding
                    });

                if (sectionError) throw sectionError;
                alert('Documento guardado y procesado correctamente.');
            }

            setShowAddModal(false);
            setEditingDocId(null);
            setNewTitle('');
            setNewContent('');
            fetchDocuments();

        } catch (error: any) {
            console.error('Error saving document:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de eliminar este documento?')) return;
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (!error) fetchDocuments();
    };

    const handleEdit = async (e: React.MouseEvent, doc: Document) => {
        e.stopPropagation();
        setEditingDocId(doc.id);
        setNewTitle(doc.title);
        setIsProcessing(true);
        setShowAddModal(true);

        // Fetch existing content
        const { data, error } = await supabase
            .from('document_sections')
            .select('content')
            .eq('document_id', doc.id)
            .limit(1);

        if (!error && data && data.length > 0) {
            setNewContent(data[0].content);
        } else {
            setNewContent('');
        }
        setIsProcessing(false);
    };

    const handleViewDocument = async (doc: Document) => {
        setSelectedDocument(doc);
        setIsViewing(true);
        setViewContent(null);

        const { data, error } = await supabase
            .from('document_sections')
            .select('content')
            .eq('document_id', doc.id);

        if (error) {
            console.error('Error fetching content:', error);
            setViewContent('Error al cargar el contenido.');
        } else {
            const content = data?.map(s => s.content).join('\n\n') || 'Sin contenido.';
            setViewContent(content);
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl pb-24">
            {/* Header */}
            <div className="flex items-center bg-white dark:bg-[#1A202C] p-4 pb-2 justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <div onClick={() => navigate(-1)} className="text-[#111318] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </div>
                <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Documentación Oficial</h2>
                <div className="w-12"></div>
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
                    <p className="flex items-center gap-2 font-bold mb-1">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        Base de Conocimiento
                    </p>
                    <p>Añade aquí normativas, acuerdos o documentos internos. El asistente utilizará esta información para responder de forma precisa cuando actives el modo "Solo Documentación".</p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Añadir Nuevo Documento
                    </button>
                )}

                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="font-bold text-gray-900 dark:text-white px-1">Documentos Activos</h3>
                    {documents.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 italic">No hay documentos guardados</p>
                    ) : (
                        documents.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => handleViewDocument(doc)}
                                className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center cursor-pointer hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">description</span>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{doc.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-1">
                                        <button onClick={(e) => handleEdit(e, doc)} className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 p-2 rounded-full transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button onClick={(e) => handleDelete(e, doc.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-full transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* View Modal (Reader) */}
            {isViewing && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-2xl pt-4 px-6 pb-6 shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="pt-2">
                                <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">{selectedDocument?.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Lectura de Documento</p>
                            </div>
                            <button
                                onClick={() => setIsViewing(false)}
                                className="size-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {viewContent === null ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Cargando documentación...</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[#111318] dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                        {viewContent}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setIsViewing(false)}
                                className="w-full bg-gray-900 dark:bg-white dark:text-black text-white py-4 rounded-2xl font-black shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-xs"
                            >
                                Cerrar Lectura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh]">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">
                            {editingDocId ? 'Editar Documento' : 'Nuevo Documento'}
                        </h3>

                        <div className="flex flex-col gap-4 overflow-y-auto grow">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Título</label>
                                <input
                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ej: Acuerdo de Vacaciones 2024"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contenido (Texto)</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white h-40 outline-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Pega aquí el texto de la normativa..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Copia y pega el texto del PDF o documento aquí.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 shrink-0">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingDocId(null);
                                    setNewTitle('');
                                    setNewContent('');
                                }}
                                disabled={isProcessing}
                                className="flex-1 py-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveDocument}
                                disabled={isProcessing}
                                className="flex-1 bg-primary text-white py-2 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? 'Procesando...' : (editingDocId ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNavigation />
        </div>
    );
};

export default DocumentsPage;
