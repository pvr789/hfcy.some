const fs = require('fs');

const path = './src/components/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the outer wrapper and main
const newStructure = `    <main className="w-full min-h-screen hero-glow-bg flex flex-col items-center justify-center overflow-hidden font-sans antialiased selection:bg-indigo-500 selection:text-white" data-purpose="application-viewport">
      <style>{\`
        .hero-glow-bg {
          background-color: #f8fafc;
          background-image: 
            radial-gradient(circle at 18% 46%, rgba(191, 219, 254, 0.55) 0%, rgba(219, 234, 254, 0.35) 28%, rgba(241, 245, 249, 0.1) 60%),
            radial-gradient(circle at 85% 20%, rgba(243, 244, 246, 0.6) 0%, transparent 45%);
        }
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
      \`}</style>
      
      {/* BEGIN: Welcome Modal Card */}
      <section className="w-full max-w-[580px] px-6 text-center flex flex-col items-center relative transition" data-purpose="welcome-dialog">`;

// We use regex to replace from the first <div className="w-full min-h-screen... to the end of the <section> opening tag.
content = content.replace(/<div className="w-full min-h-screen bg-slate-900[\s\S]*?data-purpose="welcome-dialog">/, newStructure);

// Remove the closing </div> at the end since we removed the wrapper
content = content.replace(/<\/main>\s*<\/div>/, '</main>');

fs.writeFileSync(path, content, 'utf8');
