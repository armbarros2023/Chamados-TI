import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import * as apiService from '../services/apiService';
import { getFullAvatarUrl } from '../utils';
import { ArrowLeftIcon, UserGroupIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from './icons';
import {ConfirmDialog, Notice} from './Feedback';
import { useDialogFocus } from './useDialogFocus';

// --- COMPONENTE DO MODAL (FORMULÁRIO) ---
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSaved: (savedUser: User) => void;
  userToEdit?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onUserSaved, userToEdit }) => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Usuário' | 'Administrador'>('Usuário');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useDialogFocus(isOpen, onClose, closeButtonRef);

    const isEditing = !!userToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && userToEdit) {
                setUsername(userToEdit.username);
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role as 'Usuário' | 'Administrador');
                setPassword('');
            } else {
                setUsername('');
                setName('');
                setEmail('');
                setPassword('');
                setRole('Usuário');
            }
             setError('');
        }
    }, [userToEdit, isEditing, isOpen]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validPassword = password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
        if (!isEditing && !validPassword) {
             setError('A senha deve ter 10 caracteres, incluindo maiúscula, minúscula e número.');
             return;
        }
        if (isEditing && password && !validPassword) {
            setError('A nova senha deve ter 10 caracteres, incluindo maiúscula, minúscula e número.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            let savedUser;
            const userData = { name, email, role, username, password: password || undefined };
            if (isEditing) {
                savedUser = await apiService.updateUser(userToEdit!.id!, userData);
            } else {
                savedUser = await apiService.createUser(userData);
            }
            onUserSaved(savedUser);
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    
    const inputStyle = "w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-teal-600 sm:text-sm text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
    const labelStyle = "block text-sm font-medium text-slate-700 mb-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
            <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="ui-surface max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border p-6 shadow-md sm:p-8" onClick={e => e.stopPropagation()}>
                <div className='flex justify-between items-start mb-6'>
                    <div>
                        <h2 id="user-form-title" className="text-2xl font-bold text-slate-900">{isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
                        <p className='text-slate-600 mt-1'>Preencha as informações abaixo.</p>
                    </div>
                    <button ref={closeButtonRef} onClick={onClose} className="min-h-11 min-w-11 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" aria-label="Fechar formulário de usuário">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-username" className={labelStyle}>Usuário (login)</label>
                            <input id="user-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required disabled={isEditing} className={inputStyle} autoComplete="username" />
                        </div>
                        <div>
                            <label htmlFor="user-name" className={labelStyle}>Nome completo</label>
                            <input id="user-name" type="text" value={name} onChange={e => setName(e.target.value)} required className={inputStyle} autoComplete="name" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="user-email" className={labelStyle}>E-mail</label>
                        <input id="user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputStyle} autoComplete="email" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-password" className={labelStyle}>Senha</label>
                            <input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isEditing} minLength={10} placeholder={isEditing ? 'Deixe em branco para manter' : '••••••••'} className={inputStyle} autoComplete="new-password" aria-describedby="user-password-hint" />
                            <p id="user-password-hint" className="mt-1 text-xs text-slate-600">Mínimo de 10 caracteres, com maiúscula, minúscula e número.</p>
                        </div>
                        <div>
                            <label htmlFor="user-role" className={labelStyle}>Função</label>
                            <select id="user-role" value={role} onChange={e => setRole(e.target.value as 'Usuário' | 'Administrador')} className={inputStyle}>
                                <option value="Usuário">Usuário</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </div>
                    </div>
                    
                    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{error}</p>}
                    
                    <div className="flex flex-wrap justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="min-h-11 rounded-lg bg-slate-100 px-6 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading} className="ui-primary min-h-11 rounded-lg px-8 py-2.5 font-semibold transition-colors disabled:cursor-wait disabled:opacity-70">
                           {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DA TELA ---
interface UserManagementScreenProps {

  onBackToDashboard: () => void;

}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onBackToDashboard }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const fetchedUsers = await apiService.getUsers();
                const formattedUsers = fetchedUsers.map((u: any) => ({ ...u, avatarUrl: u.avatar_url, id: u.id.toString() }));
                setUsers(formattedUsers);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleOpenModalForCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleUserSaved = (savedUser: User) => {
        const formattedUser = { ...savedUser, avatarUrl: (savedUser as any).avatar_url };
        if (editingUser) {
            setUsers(users.map(u => u.id === formattedUser.id ? formattedUser : u));
        } else {
            setUsers([...users, formattedUser]);
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            await apiService.deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
            setNotice('Usuário excluído.');
        } catch (err) {
            setNotice(`Erro ao excluir usuário: ${(err as Error).message}`);
        }
    };

    const renderContent = () => {
        if (isLoading) return <p className="text-center text-slate-600 p-12">Carregando usuários...</p>;
        if (error) return <p role="alert" className="p-12 text-center text-red-800 dark:text-red-200">Erro ao carregar usuários: {error}</p>;
        
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700/60">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Função</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-700/60">
                        {users.map(user => (
                            <tr key={user.id} className="ticket-table-row transition-colors duration-200 hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {user.avatarUrl ? <img className="h-10 w-10 rounded-full object-cover" src={getFullAvatarUrl(user.avatarUrl)} alt={user.name} loading="lazy" decoding="async" /> : (
                                                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-700 text-white text-sm font-bold">
                                                    {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                                            <div className="text-sm text-slate-600">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${user.role === 'Administrador' ? 'border-teal-300 text-teal-800' : 'border-slate-300 text-slate-800'}`}>{user.role}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button onClick={() => handleOpenModalForEdit(user)} className="min-h-11 min-w-11 rounded-lg p-2 text-blue-800 transition-colors hover:bg-blue-50 hover:text-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/50" aria-label={`Editar usuário ${user.name}`} title="Editar usuário">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => setPendingDelete(user.id!)} className="text-red-700 hover:text-red-800 p-2.5 rounded-lg hover:bg-red-50 transition-colors min-h-11 min-w-11" title="Excluir Usuário">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-1 flex-col overflow-y-auto p-4 text-slate-900 sm:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center"><UserGroupIcon className="h-8 w-8 mr-3 text-teal-700"/>Gerenciar Usuários</h1>
                        <p className="text-slate-600 mt-1">Adicione, edite ou remova usuários do sistema.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={onBackToDashboard} className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg transition-colors min-h-11">
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span>Voltar</span>
                        </button>
                         <button onClick={handleOpenModalForCreate} className="ui-primary flex min-h-11 items-center space-x-2 rounded-lg px-5 py-2 font-semibold transition-colors">
                            <PlusIcon className="h-5 w-5" />
                            <span>Novo Usuário</span>
                        </button>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 flex-grow flex flex-col">
                   {renderContent()}
                </div>
            </div>
            
            <UserFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onUserSaved={handleUserSaved}
                userToEdit={editingUser}
            />
            <Notice message={notice} onDismiss={() => setNotice(null)} />
            <ConfirmDialog message={pendingDelete ? 'Excluir este usuário permanentemente?' : null} onCancel={() => setPendingDelete(null)} onConfirm={() => { const id = pendingDelete; setPendingDelete(null); if (id) void handleDelete(id); }} />
        </>
    );
};

export default UserManagementScreen;
