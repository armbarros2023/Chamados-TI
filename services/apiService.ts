import {Ticket, TicketStatus, Comment, User} from '../types';
import {
  clearDesktopRefreshToken,
  desktopRequest,
  isInstalledRuntime,
  loadDesktopRefreshToken,
  saveDesktopRefreshToken,
} from './desktopSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3002/api/v1';
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

const request = async (url: string, options: RequestInit = {}, retry = true): Promise<Response> => {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = isInstalledRuntime()
    ? await desktopRequest(url, {...options, headers})
    : await fetch(url, {...options, headers, credentials: 'include'});
  if (response.status === 401 && retry && !url.includes('/auth/')) {
    const session = await refreshSession().catch(() => null);
    if (session?.token) return request(url, options, false);
  }
  return response;
};

const apiFetch = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await request(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Não foi possível concluir a solicitação.'}));
    throw new Error(error.message);
  }
  if (response.status === 204) return null as T;
  return response.json();
};

const jsonHeaders = {'Content-Type': 'application/json'};
export const login = async (username: string, password: string, rememberMe: boolean) => {
  const data = await apiFetch<{token: string; user: User; refreshToken?: string}>(`${API_BASE_URL}/auth/login`, {method: 'POST', headers: jsonHeaders, body: JSON.stringify({username, password, rememberMe})});
  if (isInstalledRuntime() && data.refreshToken) await saveDesktopRefreshToken(data.refreshToken);
  setAccessToken(data.token);
  return data;
};
export const refreshSession = async () => {
  const desktopRefreshToken = isInstalledRuntime() ? await loadDesktopRefreshToken() : null;
  if (isInstalledRuntime() && !desktopRefreshToken) return {token: null, user: null};
  const data = await apiFetch<{token: string | null; user: User | null; refreshToken?: string | null}>(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    ...(isInstalledRuntime() ? {headers: jsonHeaders, body: JSON.stringify({refreshToken: desktopRefreshToken})} : {}),
  });
  if (isInstalledRuntime()) {
    if (data.refreshToken) await saveDesktopRefreshToken(data.refreshToken);
    else await clearDesktopRefreshToken();
  }
  setAccessToken(data.token);
  return data;
};
export const logoutSession = async () => {
  const desktopRefreshToken = isInstalledRuntime() ? await loadDesktopRefreshToken() : null;
  try {
    await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      ...(isInstalledRuntime() ? {headers: jsonHeaders, body: JSON.stringify({refreshToken: desktopRefreshToken})} : {}),
    });
  } finally {
    if (isInstalledRuntime()) await clearDesktopRefreshToken();
    setAccessToken(null);
  }
};

export const getUsers = () => apiFetch<User[]>(`${API_BASE_URL}/users`);
export const createUser = (userData: {username: string; name: string; email: string; role: 'Administrador' | 'Usuário'; password?: string}) => apiFetch<User>(`${API_BASE_URL}/users`, {method: 'POST', headers: jsonHeaders, body: JSON.stringify(userData)});
export const updateUser = (id: string, userData: {name: string; email: string; role: 'Administrador' | 'Usuário'; password?: string}) => apiFetch<User>(`${API_BASE_URL}/users/${id}`, {method: 'PUT', headers: jsonHeaders, body: JSON.stringify(userData)});
export const deleteUser = (id: string) => apiFetch<void>(`${API_BASE_URL}/users/${id}`, {method: 'DELETE'});
export const getTickets = (limit: number, offset: number) => apiFetch<{tickets: Ticket[]; total: number}>(`${API_BASE_URL}/tickets?limit=${limit}&offset=${offset}`);
export const createTicket = (data: {title: string; description: string; category: string; priority: string}) => apiFetch<Ticket>(`${API_BASE_URL}/tickets`, {method: 'POST', headers: jsonHeaders, body: JSON.stringify(data)});
export const updateTicketStatus = (id: string, newStatus: TicketStatus) => apiFetch<Ticket>(`${API_BASE_URL}/tickets/${id}/status`, {method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({newStatus})});
export const getCommentsForTicket = (id: string) => apiFetch<Comment[]>(`${API_BASE_URL}/tickets/${id}/comments`);
export const addCommentToTicket = (id: string, text: string) => apiFetch<Comment>(`${API_BASE_URL}/tickets/${id}/comments`, {method: 'POST', headers: jsonHeaders, body: JSON.stringify({text})});
export const deleteTicket = (id: string) => apiFetch<void>(`${API_BASE_URL}/tickets/${id}`, {method: 'DELETE'});
export const pruneTicketsByCount = () => apiFetch<{message: string}>(`${API_BASE_URL}/tickets/prune/by-count`, {method: 'DELETE'});
export const pruneTicketsByDate = () => apiFetch<{message: string}>(`${API_BASE_URL}/tickets/prune/by-date`, {method: 'DELETE'});
export const markTicketAsRead = (id: string) => apiFetch<void>(`${API_BASE_URL}/tickets/${id}/mark-read`, {method: 'PATCH'});

const upload = async <T>(url: string, field: string, file: File) => {
  const body = new FormData(); body.append(field, file);
  return apiFetch<T>(url, {method: 'POST', body});
};
export const uploadAvatar = (file: File) => upload<{message: string; user: User}>(`${API_BASE_URL}/users/upload-avatar`, 'avatar', file);
export const uploadTicketAttachment = (id: string, file: File) => upload<{attachment_url: string}>(`${API_BASE_URL}/tickets/${id}/upload-attachment`, 'attachment', file);
export const getTicketAttachmentUrl = async (id: string) => {
  const response = await request(`${API_BASE_URL}/tickets/${id}/attachment`);
  if (!response.ok) throw new Error('Não foi possível carregar o anexo.');
  return URL.createObjectURL(await response.blob());
};
export const sendEmailForTicket = (id: string, message: string) => apiFetch<{message: string}>(`${API_BASE_URL}/tickets/${id}/send-email`, {method: 'POST', headers: jsonHeaders, body: JSON.stringify({message})});
