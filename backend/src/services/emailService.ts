import nodemailer from 'nodemailer';
import { User, Ticket } from '../types.js';
import {escapeHtml} from '../security/escape-html.js';


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, 
  auth: {
    user: process.env.BREVO_API_USER,
    pass: process.env.BREVO_API_PASS,
  },
  disableFileAccess: true,
  disableUrlAccess: true,
});


export const sendNewTicketNotificationToAdmins = async (ticket: Ticket, adminEmails: string[]) => {
  if (!adminEmails || adminEmails.length === 0) {
    console.log("Nenhum email de administrador encontrado para notificação de novo chamado.");
    return;
  }

  const fromEmail = process.env.VALIDATED_SENDER_EMAIL;
  if (!fromEmail) {
    console.error("VALIDATED_SENDER_EMAIL não está definido no .env. Não é possível enviar o e-mail.");
    return;
  }

  const safe = {number: escapeHtml(ticket.ticketNumber), title: escapeHtml(ticket.title), requester: escapeHtml(ticket.requester.name), email: escapeHtml(ticket.requester.email), category: escapeHtml(ticket.category), priority: escapeHtml(ticket.priority), description: escapeHtml(ticket.description)};
  const mailOptions = {
    from: `"Chemisch Suporte" <${fromEmail}>`,
    to: adminEmails.join(', '), // Envia para todos os admins
    subject: `Novo Chamado Aberto: #${safe.number} - ${safe.title}`,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #0056b3;">Novo Chamado Criado</h2>
                <p>Um novo chamado foi aberto no sistema Chemisch Suporte e precisa de atenção.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                <h3 style="color: #333;">Detalhes do Chamado</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Número:</strong> #${safe.number}</li>
                    <li><strong>Título:</strong> ${safe.title}</li>
                    <li><strong>Solicitante:</strong> ${safe.requester} (${safe.email})</li>
                    <li><strong>Categoria:</strong> ${safe.category}</li>
                    <li><strong>Prioridade:</strong> ${safe.priority}</li>
                </ul>

                <h4 style="color: #333;">Descrição:</h4>
                <div style="background-color: #f8f9fa; border: 1px solid #dbe3ea; padding: 15px; margin-top: 10px;">
                    <p style="margin: 0;">${safe.description}</p>
                </div>
                
                <p style="margin-top: 25px;">Para ver o histórico completo e interagir com o chamado, por favor, acesse o sistema Chemisch Suporte.</p>
            </div>
        </div>
    `,
  };

  try {
    // Usando o mesmo transporter já configurado no arquivo
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de notificação de novo chamado enviado com sucesso:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email de notificação de novo chamado:', error);
    // Não lançamos um erro para não quebrar a criação do chamado se o e-mail falhar
  }
};

export const sendEmailToAdmins = async (ticket: Ticket, fromUser: User, message: string, adminEmails: string[]) => {
  if (!adminEmails || adminEmails.length === 0) {
    console.log("Nenhum email de administrador encontrado para notificação.");
    return;
  }

  const safe = {name: escapeHtml(fromUser.name), requester: escapeHtml(ticket.requester.name), message: escapeHtml(message), number: escapeHtml(ticket.ticketNumber), title: escapeHtml(ticket.title), email: escapeHtml(ticket.requester.email)};
  const mailOptions = {
    from: `"${safe.name} - Chemisch Suporte" <${process.env.VALIDATED_SENDER_EMAIL}>`,
    to: adminEmails.join(', '),
    subject: `[${safe.number}] Mensagem sobre o chamado: ${safe.title}`,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #c75a00;">Notificação de Chamado</h2>
                <p>O usuário <strong>${safe.name}</strong> enviou uma mensagem sobre o chamado de <strong>${safe.requester}</strong>.</p>
                <p><strong>Mensagem do Usuário:</strong></p>
                <div style="background-color: #fff8f0; border: 1px solid #f2d4b4; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-style: italic;">"${safe.message}"</p>
                </div>
                <p>Para ver o histórico completo e responder, por favor, acesse o sistema Chemisch Suporte.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <div style="font-size: 0.9em; color: #777;">
                    <p><strong>ID do Chamado:</strong> ${safe.number}</p>
                    <p><strong>Título:</strong> ${safe.title}</p>
                    <p><strong>Solicitante Original:</strong> ${safe.requester} (${safe.email})</p>
                </div>
            </div>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email para administradores enviado com sucesso:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email para administradores:', error);
    throw new Error('O serviço de email falhou ao enviar a notificação para os administradores.');
  }
};
