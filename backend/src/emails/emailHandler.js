import { mailtrapClient, sender } from '../lib/mailtrap.js';
import {
  createWelcomeEmailTemplate,
  connectionAcceptedEmailTemplate,
  newCommentEmailTemplate,
} from './emailTemplate.js';

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipients = [
    {
      email: email,
    },
  ];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Welcome to UnLinked!',
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: 'welcome',
    });
    console.log('Welcome email sent successfully.');
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendConnectionAcceptedEmail = async (
  email,
  senderName,
  recipientName,
  profileUrl,
) => {
  const recipients = [
    {
      email: email,
    },
  ];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: `${senderName} accepted your connection request!`,
      html: connectionAcceptedEmailTemplate(
        senderName,
        recipientName,
        profileUrl,
      ),
      category: 'connection_accepted',
    });
    console.log('Connection accepted email sent successfully.');
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendCommentNotificationEmail = async (
  email,
  senderName,
  recipientName,
  content,
  postUrl,
) => {
  const recipients = [
    {
      email: email,
    },
  ];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: `${senderName} commented on your post!`,
      html: newCommentEmailTemplate(
        senderName,
        recipientName,
        content,
        postUrl,
      ),
      category: 'comment_notification',
    });
    console.log('Comment notification email sent successfully.');
    return response;
  } catch (error) {
    throw error;
  }
};
