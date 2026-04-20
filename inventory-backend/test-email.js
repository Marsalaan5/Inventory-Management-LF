import { sendTemplateEmail } from './services/emailService.js';

try {
  await sendTemplateEmail(
    'follow_up',
    'warehousea007@gmail.com',
    {
      recipientName: 'warehousea007',
      originalDate: '5/1/2026',
      emailSubject: 'Instant Test',
      senderName: 'Instant Tester'
    },
    'Following Up: Instant Test',
    {
    senderId: 2,
      senderEmail: 'ras@123',
      senderName: 'Instant Tester'
    }
  );

  console.log('Test email sent successfully');
  process.exit(0);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
