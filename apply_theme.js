const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.jsx') || dirFile.endsWith('.css')) filelist.push(dirFile);
        }
    });
    return filelist;
};

const components = walkSync(path.join(__dirname, 'src'));

components.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace utility classes to fit the dark theme
    content = content.replace(/bg-white/g, 'bg-[#121826]'); // White cards -> slightly lighter dark background
    content = content.replace(/bg-gray-50/g, 'bg-background'); // Main background areas -> dark background
    content = content.replace(/bg-gray-100/g, 'bg-[#121826]');
    content = content.replace(/bg-gray-200/g, 'bg-gray-800');

    content = content.replace(/text-gray-800/g, 'text-gray-100');
    content = content.replace(/text-gray-700/g, 'text-gray-200');
    content = content.replace(/text-gray-600/g, 'text-gray-300');
    content = content.replace(/text-gray-500/g, 'text-gray-400');
    content = content.replace(/text-black/g, 'text-white');

    // Replace Hex Codes for Tailwind Arbitrary Values

    // Old Dark Blue used in text (Headers)
    content = content.replace(/text-\[\#21277B\]/gi, 'text-white');
    // Old Dark Blue used in backgrounds
    content = content.replace(/bg-\[\#21277B\]/gi, 'bg-accent');
    content = content.replace(/border-\[\#21277B\]/gi, 'border-accent');

    // Old Primary Blue
    content = content.replace(/bg-\[\#006AD7\]/gi, 'bg-primary');
    content = content.replace(/text-\[\#006AD7\]/gi, 'text-primary');
    content = content.replace(/border-\[\#006AD7\]/gi, 'border-primary');
    content = content.replace(/to-\[\#006AD7\]/gi, 'to-primary');
    content = content.replace(/from-\[\#006AD7\]/gi, 'from-primary');

    // Old Secondary Light Blue
    content = content.replace(/bg-\[\#9AD9EA\]/gi, 'bg-secondary');
    content = content.replace(/text-\[\#9AD9EA\]/gi, 'text-secondary');

    // Direct hex replacements for any stray JS objects or unhandled classes
    content = content.replace(/#006AD7/gi, '#5B8CFF');
    content = content.replace(/#9AD9EA/gi, '#A855F7');
    content = content.replace(/#21277B/gi, '#A855F7');

    fs.writeFileSync(file, content);
});

console.log('✅ Theme updates applied to all components.');
