const fs = require('fs');
const files = [
    'admin-dashboard.html',
    'admin-categories.html',
    'admin-products.html',
    'admin-settings.html'
];

const boxiconsLink = `<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>\n    <link rel="stylesheet" href="css/admin.css">`;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add Boxicons
    content = content.replace('<link rel="stylesheet" href="css/admin.css">', boxiconsLink);
    
    // Replace Emojis
    content = content.replace(/<span>📊<\/span>/g, "<i class='bx bxs-dashboard'></i>");
    content = content.replace(/<span>📁<\/span>/g, "<i class='bx bxs-folder'></i>");
    content = content.replace(/<span>🛍️<\/span>/g, "<i class='bx bxs-shopping-bags'></i>");
    content = content.replace(/<span>⚙️<\/span>/g, "<i class='bx bxs-cog'></i>");
    content = content.replace(/<span>🚪<\/span>/g, "<i class='bx bx-log-out'></i>");
    
    fs.writeFileSync(file, content, 'utf8');
}
console.log('Icons replaced successfully!');
