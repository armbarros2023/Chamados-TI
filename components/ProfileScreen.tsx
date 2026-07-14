import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types';
import { ArrowLeftIcon, CameraIcon, CheckIcon, XMarkIcon } from './icons';
import * as apiService from '../services/apiService';
import { getFullAvatarUrl } from '../utils';

interface ProfileScreenProps {
  user: User;
  onBackToDashboard: () => void;
  onAvatarUpdated: (updatedUser: User) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBackToDashboard, onAvatarUpdated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedFile(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const { user: updatedUserFromServer } = await apiService.uploadAvatar(selectedFile);
      onAvatarUpdated(updatedUserFromServer);
      handleCancel();
    } catch (error) {
      setFeedback(`Erro ao salvar imagem: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto p-4 text-slate-900 sm:p-8">
       <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />

        <div className="w-full max-w-4xl">
            {feedback && <p role="status" className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-800">{feedback}</p>}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Meu Perfil</h1>
                    <p className="text-slate-600 mt-1">Gerencie suas informações pessoais e avatar.</p>
                </div>
                <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg transition-colors min-h-11"
                aria-label="Voltar ao Painel"
                >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Voltar</span>
                </button>
            </div>

            <div className="ui-surface overflow-hidden rounded-xl border">
                <div className="h-40 bg-teal-50 border-b border-teal-100 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-full ring-4 ring-gray-800 flex items-center justify-center bg-slate-100 overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" decoding="async" />
                                ) : user.avatarUrl ? (
                                    <img src={getFullAvatarUrl(user.avatarUrl)} alt={user.name} className="h-full w-full object-cover" decoding="async" />
                                ) : (
                                    <div className="h-32 w-32 rounded-full flex items-center justify-center bg-teal-700 text-white text-5xl font-bold">
                                        {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-900/85 text-white transition-colors hover:bg-teal-700"
                                aria-label="Alterar foto de perfil"
                            >
                                <CameraIcon className="h-8 w-8 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="pt-20 px-8 pb-8">
                    <div className='flex justify-between items-start'>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                            <p className="text-md text-teal-700 font-semibold">{user.role}</p>
                        </div>
                        {imagePreview && (
                            <div className="flex flex-wrap items-center gap-3">
                                <button onClick={handleSave} disabled={isLoading} className="min-h-11 rounded-lg bg-green-700 px-4 py-2 font-bold text-white transition-colors hover:bg-green-800 disabled:bg-green-800">
                                    <CheckIcon className="h-5 w-5 mr-2" /> {isLoading ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button onClick={handleCancel} className="min-h-11 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-800 transition-colors hover:bg-slate-200">
                                    <XMarkIcon className="h-5 w-5 mr-2" /> Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg">
                            <label className="block text-xs font-medium text-slate-600">Nome de Usuário (login)</label>
                            <p className="text-md text-slate-700 mt-1">{user.username}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <label className="block text-xs font-medium text-slate-600">Email</label>
                            <p className="text-md text-slate-700 mt-1">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileScreen;
