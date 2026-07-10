import React, { useState, useEffect } from 'react';
import { User } from '../types';
import * as apiService from '../services/apiService';
import { getFullAvatarUrl } from '../utils';
import { ArrowLeftIcon, UserGroupIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from './icons';
import {ConfirmDialog, Notice} from './Feedback';

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
        if (!isEditing && password.length < 4) {
             setError('A senha deve ter pelo menos 4 caracteres.');
             return;
        }
        if (isEditing && password && password.length < 4) {
            setError('A nova senha deve ter pelo menos 4 caracteres.');
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-md w-full max-w-lg p-6 sm:p-8" onClick={e => e.stopPropagation()}>
                <div className='flex justify-between items-start mb-6'>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
                        <p className='text-slate-600 mt-1'>Preencha as informações abaixo.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white hover:bg-white rounded-full p-2 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Usuário (login)</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required disabled={isEditing} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label className={labelStyle}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputStyle} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isEditing} placeholder={isEditing ? 'Deixe em branco para manter' : '••••••••'} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>Função</label>
                            <select value={role} onChange={e => setRole(e.target.value as 'Usuário' | 'Administrador')} className={inputStyle}>
                                <option value="Usuário">Usuário</option>
                                <option value="Administrador">Administrador</option>
                            </select>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm border border-red-500/20">{error}</p>}
                    
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading} className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-8 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-wait">
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
        if (error) return <p className="text-center text-red-400 p-12">Erro ao carregar usuários: {error}</p>;
        
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
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {user.avatarUrl ? <img className="h-10 w-10 rounded-full object-cover" src={getFullAvatarUrl(user.avatarUrl)} alt={user.name} /> : (
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
                                        <button onClick={() => handleOpenModalForEdit(user)} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors" title="Editar Usuário">
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
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto text-slate-900 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center"><UserGroupIcon className="h-8 w-8 mr-3 text-teal-700"/>Gerenciar Usuários</h1>
                        <p className="text-slate-600 mt-1">Adicione, edite ou remova usuários do sistema.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={onBackToDashboard} className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg transition-colors min-h-11">
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span>Voltar</span>
                        </button>
                         <button onClick={handleOpenModalForCreate} className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-5 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-orange-600/20 transform hover:scale-105">
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
