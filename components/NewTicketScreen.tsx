import React, { useEffect, useState } from 'react';
import { User, TicketCategory, TicketPriority, TicketSystem } from '../types';
import * as apiService from '../services/apiService';
import { getFullAvatarUrl } from '../utils';
import { ArrowLeftIcon, PhotoIcon, TagIcon, Squares2X2Icon, ShieldExclamationIcon, DocumentTextIcon, UserCircleIconComponent, XMarkIcon } from './icons';
import { departments, ticketCategories, ticketPriorities, ticketSystems } from '../constants';

interface NewTicketScreenProps {
  user: User;
  onTicketCreate: () => void;
  onCancel: () => void;
}

const NewTicketScreen: React.FC<NewTicketScreenProps> = ({ user, onTicketCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.Software);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.Medium);
  const [department, setDepartment] = useState(departments[0]);
  const [system, setSystem] = useState<TicketSystem | ''>('');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'video/mp4' || file.type === 'video/quicktime') {
        const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
        if (file.size > maxSize) {
          removeAttachment();
          setError(`O arquivo excede o limite de ${file.type.startsWith('video/') ? '100 MB' : '20 MB'}.`);
          return;
        }
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setAttachmentFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
      } else {
        removeAttachment();
        setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc).');
      }
    }
  };

  const removeAttachment = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setAttachmentFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !system) {
      setError('Título, Sistema e Descrição são campos obrigatórios.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    let ticketCreated = false;
    try {
      const newTicket = await apiService.createTicket({
        title,
        category,
        priority,
        department,
        system,
        description,
      });
      ticketCreated = true;

      if (attachmentFile && newTicket.id) {
        await apiService.uploadTicketAttachment(newTicket.id, attachmentFile);
      }

      onTicketCreate();

    } catch (err: any) {
      setError(ticketCreated
        ? `Chamado criado, mas o anexo não foi enviado: ${err.message}`
        : `Erro ao criar chamado: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "ui-input w-full rounded-lg border py-3 px-4 text-slate-900 focus:ring-2 focus:ring-teal-600 sm:text-sm";
  const labelStyle = "flex items-center text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 text-slate-900 sm:p-8">
      <div className="mb-8 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold">Criar Novo Chamado</h1>
            <p className="text-slate-600 mt-1">Preencha os detalhes abaixo para abrir uma nova solicitação.</p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg transition-colors min-h-11"
          aria-label="Voltar ao Painel"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Voltar</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className='ui-surface rounded-xl border p-6'>
                <label htmlFor="ticketTitle" className={labelStyle}>
                    <TagIcon className="h-5 w-5 mr-2 text-slate-600"/>
                    Título do Chamado <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    type="text"
                    id="ticketTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputStyle}
                    required
                />
            </div>
            
            <div className='ui-surface grid grid-cols-1 gap-6 rounded-xl border p-6 md:grid-cols-2'>
                <div>
                    <label htmlFor="ticketCategory" className={labelStyle}>
                        <Squares2X2Icon className="h-5 w-5 mr-2 text-slate-600"/>
                        Categoria
                    </label>
                    <select
                    id="ticketCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    className={inputStyle}
                    >
                    {ticketCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="ticketDepartment" className={labelStyle}>Departamento</label>
                    <select id="ticketDepartment" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputStyle} required>
                      {departments.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="ticketSystem" className={labelStyle}>
                        <Squares2X2Icon className="h-5 w-5 mr-2 text-slate-600"/>
                        Sistema <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="ticketSystem"
                      value={system}
                      onChange={(e) => setSystem(e.target.value as TicketSystem)}
                      className={inputStyle}
                      required
                    >
                      <option value="" disabled>Selecione o sistema</option>
                      {ticketSystems.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="ticketPriority" className={labelStyle}>
                        <ShieldExclamationIcon className="h-5 w-5 mr-2 text-slate-600"/>
                        Prioridade
                    </label>
                    <select
                    id="ticketPriority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className={inputStyle}
                    >
                    {ticketPriorities.map(prio => (
                        <option key={prio.value} value={prio.value}>{prio.label}</option>
                    ))}
                    </select>
                </div>
            </div>

            <div className='ui-surface rounded-xl border p-6'>
                <label htmlFor="ticketDescription" className={labelStyle}>
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-slate-600"/>
                    Descrição Detalhada <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    id="ticketDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className={`${inputStyle} min-h-48`}
                    placeholder="Descreva o problema ou a solicitação com o máximo de detalhes possível..."
                    required
                ></textarea>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <div className='ui-surface rounded-xl border p-6'>
                <h3 className={labelStyle}>
                    <UserCircleIconComponent className="h-5 w-5 mr-2 text-slate-600"/>
                    Solicitante
                </h3>
                <div className="flex items-center space-x-3 mt-4">
                    {user.avatarUrl ? (
                    <img src={getFullAvatarUrl(user.avatarUrl)} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                    <div className="h-11 w-11 rounded-full flex items-center justify-center bg-teal-700 text-white text-base font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                    </div>
                    )}
                    <div>
                    <p className="text-md font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.role}</p>
                    </div>
                </div>
            </div>

             <div className='ui-surface rounded-xl border p-6'>
                <h3 className={labelStyle}>
                    <PhotoIcon className="h-5 w-5 mr-2 text-slate-600"/>
                    Anexar Print (Opcional)
                </h3>
                 <div className="mt-4">
                    {!imagePreview && (
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="imageUpload"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100/60 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <PhotoIcon className="w-8 h-8 mb-4 text-slate-500" />
                                    <p className="mb-2 text-sm text-slate-600"><span className="font-semibold text-teal-700">Clique para enviar</span> ou arraste</p>
                                    <p className="text-xs text-slate-500">JPG, PNG, WebP (20 MB) ou MP4/MOV (100 MB)</p>
                                </div>
                                <input id="imageUpload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={handleFileChange} />
                            </label>
                        </div> 
                    )}
                    {imagePreview && (
                        <div className="relative group">
                            {attachmentFile?.type.startsWith('video/') ? (
                              <video src={imagePreview} controls className="w-full h-auto rounded-lg max-h-60" aria-label="Preview do vídeo anexado" />
                            ) : (
                              <img src={imagePreview} alt="Preview do anexo" className="w-full h-auto rounded-lg object-contain max-h-60" />
                            )}
                             <button
                                type="button"
                                onClick={removeAttachment}
                                className="absolute right-2 top-2 min-h-11 min-w-11 rounded-full bg-slate-900/85 p-1.5 text-white transition-colors hover:bg-red-700"
                                aria-label="Remover anexo"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </div>

        <div className="lg:col-span-3 mt-4">
             {error && <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{error}</p>}
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isSubmitting} 
                    className="min-h-11 rounded-lg bg-slate-100 px-6 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="ui-primary flex min-h-11 items-center justify-center space-x-2 rounded-lg px-8 py-2.5 font-semibold transition-colors disabled:cursor-wait disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                        </>
                    ) : (
                        'Criar Chamado'
                    )}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default NewTicketScreen;
