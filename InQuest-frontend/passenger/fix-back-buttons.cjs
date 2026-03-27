const fs = require('fs');
const path = require('path');

const excludeFiles = [
    'Home.jsx', 'Trips.jsx', 'Wallet.jsx', 'Notifications.jsx', 'Profile.jsx',
    'Landing.jsx', 'Splash.jsx', 'Register.jsx', 'VerifyOTP.jsx', 'Onboarding.jsx',
    'ProfileSetup.jsx', 'NotFound.jsx'
];

const standardButton = `<button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>`;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            const fileName = path.basename(fullPath);
            if (!excludeFiles.includes(fileName)) {
                processFile(fullPath);
            }
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Ensure ChevronLeft is imported
    if (!content.includes('ChevronLeft')) {
        const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
        if (importMatch) {
            const currentImports = importMatch[1];
            const newImports = currentImports + ', ChevronLeft';
            content = content.replace(importMatch[0], `import {${newImports}} from 'lucide-react'`);
        } else {
            // Add import if not exists
            content = `import { ChevronLeft } from 'lucide-react';\n` + content;
        }
    }

    // 2. Replace existing back button
    const buttonRegex = /<button[^>]*onClick={\(\)\s*=>\s*navigate\(-1\)}[\s\S]*?<\/button>/;
    if (buttonRegex.test(content)) {
        content = content.replace(buttonRegex, standardButton);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Replaced in ${filePath}`);
    } else {
        console.log(`NO BACK BUTTON FOUND in ${filePath}`);
    }
}

processDirectory(path.join(__dirname, 'pages'));
