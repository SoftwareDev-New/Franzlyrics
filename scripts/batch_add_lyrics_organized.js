const fs = require('fs-extra');
const path = require('path');
const { parse } = require('csv-parse');

const LYRICS_DIR = path.join(__dirname, '..', 'Front-End', 'lyrics');
const SONGS_JSON_PATH = path.join(__dirname, '..', 'Front-End', 'data', 'songs.json');
const CSV_TEMPLATE_PATH = path.join(__dirname, 'lyrics_template_new.csv');

// Handle multiline lyrics properly
const processLyrics = (lyrics) => {
    if (!lyrics) return '';
    return lyrics
        .split(/\\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
};

// Create a safe folder name from song title
const createSafeFolder = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');
};

// Get the first letter of the artist name for folder organization
const getArtistFolder = (artist) => {
    const firstLetter = artist.charAt(0).toUpperCase();
    return /[A-Z]/.test(firstLetter) ? firstLetter : '#';
};

// Process a single song
async function processSong(songData) {
    try {
        // Create artist folder
        const artistFolder = getArtistFolder(songData.artist);
        const artistPath = path.join(LYRICS_DIR, artistFolder);
        await fs.ensureDir(artistPath);

        // Create song folder
        const songFolder = createSafeFolder(songData.title);
        const songPath = path.join(artistPath, songFolder);
        await fs.ensureDir(songPath);

        // Create HTML file
        const htmlPath = path.join(songPath, 'index.html');
        const htmlContent = generateHTMLContent(songData);
        await fs.writeFile(htmlPath, htmlContent);

        // Create CSS file
        const cssPath = path.join(songPath, 'style.css');
        const cssContent = generateCSSContent();
        await fs.writeFile(cssPath, cssContent);

        // Create JavaScript file
        const jsPath = path.join(songPath, 'script.js');
        const jsContent = generateJSContent(songData);
        await fs.writeFile(jsPath, jsContent);

        // Return song data for songs.json
        return {
            title: songData.title,
            artist: songData.artist,
            year: parseInt(songData.year) || null,
            path: `lyrics/${artistFolder}/${songFolder}`
        };
    } catch (error) {
        console.error(`Error processing song: ${songData.title}`, error);
        return null;
    }
}

// Generate file contents
function generateHTMLContent(songData) {
    const lines = songData.lyrics.split('\n');
    const formattedLyrics = lines
        .map(line => `            <p>${line.trim() || '&nbsp;'}</p>`)
        .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${songData.title} - ${songData.artist}</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>
</head>
<body>
    <div class="container lyrics-container">
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container">
                <a class="navbar-brand" href="../../../index.html">FranzLyrics</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" href="../../../index.html">Home</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="row">
            <div class="col-md-8 offset-md-2">
                <div class="lyrics-content">
                    <h1>${songData.title}</h1>
                    <h2>${songData.artist}</h2>
                    ${songData.album ? `<p class="album">Album: ${songData.album} (${songData.year})</p>` : ''}

                    ${songData.spotify_link || songData.youtube_link || songData.instagram_link ? `
                    <div class="streaming-links mb-4">
                        ${songData.spotify_link ? `<a href="${songData.spotify_link}" target="_blank" class="btn btn-success me-2">Listen on Spotify</a>` : ''}
                        ${songData.youtube_link ? `<a href="${songData.youtube_link}" target="_blank" class="btn btn-danger me-2">Watch on YouTube</a>` : ''}
                        ${songData.instagram_link ? `<a href="${songData.instagram_link}" target="_blank" class="btn btn-primary">Follow on Instagram</a>` : ''}
                    </div>` : ''}

                    <div class="lyrics">
${formattedLyrics}
                    </div>

                    <div class="song-meta">
                        <div class="social-links">
                            <a href="#" class="btn btn-primary prev-song">Previous Song</a>
                            <a href="../../../index.html" class="btn btn-secondary">Back to Home</a>
                            <a href="#" class="btn btn-primary next-song">Next Song</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateCSSContent() {
    return `@import url('../../../css/bootstrap.min.css');

body {
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.6;
    background-color: #f8f9fa;
    color: #333;
}

.navbar {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
}

.lyrics-container {
    padding: 2rem 0;
}

.lyrics-content {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    padding: 2rem;
    margin-bottom: 2rem;
    transition: transform 0.3s ease;
}

h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
}

h2 {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 1.5rem;
}

.album {
    color: #666;
    font-style: italic;
    margin-bottom: 1.5rem;
}

.lyrics {
    font-size: 1.1rem;
    line-height: 1.8;
    margin: 2rem 0;
}

.lyrics p {
    margin-bottom: 0.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.song-meta {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
    text-align: center;
}

.social-links .btn {
    margin: 0 0.5rem;
}

@media (max-width: 768px) {
    .lyrics-content {
        padding: 1rem;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    h2 {
        font-size: 1.2rem;
    }
    
    .lyrics {
        font-size: 1rem;
    }
}`;
}

function generateJSContent(songData) {
    return `document.addEventListener('DOMContentLoaded', () => {
    // Add animation to lyrics on scroll
    const lyrics = document.querySelectorAll('.lyrics p');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );

    lyrics.forEach(lyric => {
        observer.observe(lyric);
    });

    // Handle navigation buttons
    const prevButton = document.querySelector('.prev-song');
    const nextButton = document.querySelector('.next-song');

    // TODO: Implement previous/next song navigation
    prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Navigate to previous song
    });

    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Navigate to next song
    });
});`;
}

// Main function to process the CSV file
async function processLyricsCSV() {
    try {
        // Read existing songs.json
        let songsData = { songs: [] };
        try {
            songsData = await fs.readJson(SONGS_JSON_PATH);
        } catch (error) {
            console.log('No existing songs.json found, creating new one');
        }

        // Read and parse CSV file
        const csvContent = await fs.readFile(CSV_TEMPLATE_PATH, 'utf-8');
        const records = await new Promise((resolve, reject) => {
            parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                quote: '"',
                escape: '"'
            }, (err, records) => {
                if (err) reject(err);
                else resolve(records);
            });
        });

        console.log(`Found ${records.length} songs to process`);

        // Process songs in parallel with a limit of 5 concurrent operations
        const batchSize = 5;
        const results = [];
        
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(song => processSong(song)));
            results.push(...batchResults.filter(r => r !== null));
            
            console.log(`Processed ${Math.min(i + batchSize, records.length)}/${records.length} songs`);
        }

        // Update songs.json with new entries
        const existingTitles = new Set(songsData.songs.map(s => `${s.artist}-${s.title}`));
        const newSongs = results.filter(song => !existingTitles.has(`${song.artist}-${song.title}`));
        
        songsData.songs = [...songsData.songs, ...newSongs];
        await fs.writeJson(SONGS_JSON_PATH, songsData, { spaces: 2 });

        console.log(`Successfully processed ${results.length} songs`);
        console.log(`Added ${newSongs.length} new songs to songs.json`);

    } catch (error) {
        console.error('Error processing CSV:', error);
    }
}

// Run the script
processLyricsCSV().then(() => {
    console.log('Batch processing complete!');
}).catch(console.error);
