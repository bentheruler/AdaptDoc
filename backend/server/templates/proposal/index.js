/**
 * @file server/templates/proposal/index.js
 * @description Exports HTML/CSS layouts for project proposals.
 */

const formal = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Georgia', serif; line-height: 1.8; color: #000; max-width: 900px; margin: 50px auto; padding: 40px; border: 1px solid #ccc; }
        h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
        h2 { border-left: 5px solid #000; padding-left: 10px; margin-top: 30px; }
        .section { margin-bottom: 25px; }
        .footer { margin-top: 50px; text-align: center; font-style: italic; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>${data.title || 'Project Proposal'}</h1>
    
    <div class="section">
        <h2>Executive Summary</h2>
        <p>${data.objective || 'Provide objective here...'}</p>
    </div>

    <div class="section">
        <h2>Methodology</h2>
        <p>${data.methodology || 'Describe methodology here...'}</p>
    </div>

    <div class="section">
        <h2>Timeline & Budget</h2>
        <p><strong>Timeline:</strong> ${data.timeline || 'Not specified'}</p>
        <p><strong>Budget:</strong> ${data.budget || 'Not specified'}</p>
    </div>

    <div class="section">
        <h2>Conclusion</h2>
        <p>${data.conclusion || 'Provide conclusion here...'}</p>
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
`;

const clean = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica', sans-serif; line-height: 1.6; color: #444; max-width: 850px; margin: 0 auto; padding: 60px; background: #fff; }
        .header { background: #2c3e50; color: #fff; padding: 40px; margin-bottom: 40px; border-radius: 8px; }
        h1 { margin: 0; font-weight: 300; }
        h2 { color: #2c3e50; font-weight: 600; margin-top: 40px; }
        .content-box { padding: 0 20px; }
        .meta { color: #7f8c8d; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.title || 'Project Proposal'}</h1>
        <p class="meta">Proposal Created: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="content-box">
        <h2>Objective</h2>
        <p>${data.objective || 'Provide objective here...'}</p>

        <h2>Our Approach</h2>
        <p>${data.methodology || 'Describe methodology here...'}</p>

        <h2>Project Roadmap</h2>
        <p>${data.timeline || 'TBD'}</p>

        <h2>Investment</h2>
        <p>${data.budget || 'TBD'}</p>

        <h2>Summary</h2>
        <p>${data.conclusion || 'Final thoughts...'}</p>
    </div>
</body>
</html>
`;

module.exports = { formal, clean };
