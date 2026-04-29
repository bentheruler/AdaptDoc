/**
 * @file server/templates/coverLetter/index.js
 * @description Exports HTML/CSS layouts for cover letters.
 */

const classic = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
        .header { text-align: right; margin-bottom: 40px; }
        .recipient { margin-bottom: 30px; }
        .subject { font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
        .content { white-space: pre-line; }
        .signature { margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <p>${data.date || new Date().toLocaleDateString()}</p>
    </div>
    <div class="recipient">
        <p>${data.recipient || 'Hiring Manager'}</p>
    </div>
    <div class="subject">
        <p>RE: ${data.subject || 'Job Application'}</p>
    </div>
    <p>${data.salutation || 'Dear Sir/Madam,'}</p>
    <div class="content">
        ${data.body || 'Letter body content goes here...'}
    </div>
    <div class="signature">
        <p>${data.closing || 'Sincerely,'}</p>
        <p><strong>${data.signature || 'Your Name'}</strong></p>
    </div>
</body>
</html>
`;

const modern = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 40px; }
        .container { border-top: 10px solid #3498db; padding-top: 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
        .recipient-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; }
        .subject { color: #2980b9; font-size: 1.2em; margin-bottom: 25px; }
        .content { font-size: 1.1em; }
        .signature { margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div><h1>COVER LETTER</h1></div>
            <div><p>${data.date || new Date().toLocaleDateString()}</p></div>
        </div>
        <div class="recipient-box">
            <p>${data.recipient || 'Hiring Manager'}</p>
        </div>
        <h2 class="subject">${data.subject || 'Application for Position'}</h2>
        <p>${data.salutation || 'Dear Hiring Team,'}</p>
        <div class="content">
            ${data.body || 'Letter body content goes here...'}
        </div>
        <div class="signature">
            <p>${data.closing || 'Best regards,'}</p>
            <p><strong>${data.signature || 'Your Name'}</strong></p>
        </div>
    </div>
</body>
</html>
`;

module.exports = { classic, modern };
