import React, { useState } from 'react';
import { User, TicketCategory, TicketPriority } from '../types';
import * as apiService from '../services/apiService';
import { getFullAvatarUrl } from '../utils';
import { ArrowLeftIcon, PhotoIcon, TagIcon, Squares2X2Icon, ShieldExclamationIcon, DocumentTextIcon, UserCircleIconComponent, XMarkIcon } from './icons';
import { ticketCategories, ticketPriorities } from '../constants';

interface NewTicketScreenProps {
  user: User;
  onTicketCreate: () => void;
  onCancel: () => void;
}

const NewTicketScreen: React.FC<NewTicketScreenProps> = ({ user, onTicketCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.Software);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.Medium);
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
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
    setAttachmentFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Título e Descrição são campos obrigatórios.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const newTicket = await apiService.createTicket({
        title,
        category,
        priority,
        description,
      });

      if (attachmentFile && newTicket.id) {
        await apiService.uploadTicketAttachment(newTicket.id, attachmentFile);
      }

      onTicketCreate();

    } catch (err: any) {
      setError(`Erro ao criar chamado: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-teal-600 sm:text-sm text-slate-900";
  const labelStyle = "flex items-center text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto text-slate-900 flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
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
            <div className='bg-white p-6 rounded-2xl border border-slate-200'>
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
            
            <div className='bg-white p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6'>
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

            <div className='bg-white p-6 rounded-2xl border border-slate-200'>
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
            <div className='bg-white p-6 rounded-2xl border border-slate-200'>
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

             <div className='bg-white p-6 rounded-2xl border border-slate-200'>
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
                                    <p className="text-xs text-slate-500">PNG, JPG ou WebP (máx. 5 MB)</p>
                                </div>
                                <input id="imageUpload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                            </label>
                        </div> 
                    )}
                    {imagePreview && (
                        <div className="relative group">
                            <img src={imagePreview} alt="Preview do anexo" className="w-full h-auto rounded-lg object-contain max-h-60" />
                             <button
                                type="button"
                                onClick={removeAttachment}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
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
             {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg text-center border border-red-500/20 mb-6">{error}</p>}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isSubmitting} 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-8 rounded-lg flex items-center justify-center space-x-2 transition-colors min-h-11 disabled:opacity-70 disabled:cursor-wait"
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
