document.addEventListener('DOMContentLoaded', () => {
    // Utility function to extract lyrics text
    const getLyricsText = (lyricsElement) => {
        if (!lyricsElement) return '';
        const paragraphs = lyricsElement.querySelectorAll('.verse p, .chorus p');
        return Array.from(paragraphs).map(p => p.textContent.trim()).join('\n\n');
    };

    // Utility function for button feedback
    const showButtonFeedback = (button, originalHTML, successColor = 'rgba(40, 167, 69, 0.25)', originalColor = 'rgba(255,255,255,0.15)') => {
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = successColor;
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = originalColor;
        }, 2000);
    };

    // Copy lyrics functionality
    const copyBtn = document.getElementById('copyLyrics');
    const lyricsText = document.getElementById('lyricsText');
    if (copyBtn && lyricsText) {
        copyBtn.addEventListener('click', async () => {
            const textToCopy = getLyricsText(lyricsText);
            if (!textToCopy) {
                console.warn('No lyrics found to copy.');
                return;
            }
            try {
                await navigator.clipboard.writeText(textToCopy);
                showButtonFeedback(copyBtn, copyBtn.innerHTML);
            } catch (err) {
                console.error('Failed to copy lyrics:', err);
            }
        });
    }

    // Share lyrics functionality
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn && lyricsText) {
        shareBtn.addEventListener('click', async () => {
            const textToShare = getLyricsText(lyricsText);
            if (!textToShare) {
                console.warn('No lyrics found to share.');
                return;
            }
            const songTitle = document.querySelector('.song-info h1')?.textContent || 'Lyrics';
            const songArtist = document.querySelector('.song-info h2')?.textContent || '';
            const shareData = `${songTitle} by ${songArtist}\n\n${textToShare}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: songTitle,
                        text: shareData,
                        url: window.location.href
                    });
                } catch (err) {
                    // User cancelled or error, no action needed
                }
            } else {
                // Fallback: copy to clipboard
                try {
                    await navigator.clipboard.writeText(shareData);
                    showButtonFeedback(shareBtn, shareBtn.innerHTML);
                } catch (err) {
                    console.error('Failed to copy lyrics for sharing:', err);
                    alert('Could not share or copy lyrics.');
                }
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    const azResultsSection = document.getElementById('az-results-section');
    const azResultsTitle = document.getElementById('az-results-title');
    const azResultsList = document.getElementById('azResultsList');
    
    if (searchInput && searchBtn && azResultsSection && azResultsTitle && azResultsList) {
        // Get base path for data
        function getBasePath() {
            const path = window.location.pathname;
            if (path.includes('/lyrics/')) {
                return '../../../';
            }
            if (path.includes('/html/')) {
                return '../';
            }
            return '';
        }

        // Function to perform the search
        const performSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            // Show loading state
            azResultsTitle.textContent = 'Searching...';
            azResultsList.innerHTML = '';
            azResultsSection.style.display = 'block';

            // Fetch songs data
            fetch(getBasePath() + 'data/songs.json')
                .then(response => response.json())
                .then(data => {
                    const songs = data.songs || [];
                    const results = songs.filter(song => 
                        song.title.toLowerCase().includes(query) || 
                        song.artist.toLowerCase().includes(query)
                    );

                    // Update results
                    azResultsTitle.textContent = results.length > 0 
                        ? `Search Results for "${query}"` 
                        : `No results found for "${query}"`;

                    if (results.length > 0) {
                        azResultsList.innerHTML = results.map(song => {
                            // Remove the /Front-End/ prefix from the path
                            const cleanPath = song.path.replace('/Front-End/', '');
                            return `
                                <li>
                                    <a href="${getBasePath()}${cleanPath}" class="song-link">
                                        <strong>${song.title}</strong> - ${song.artist}
                                    </a>
                                </li>
                            `;
                        }).join('');
                    }

                    // Scroll results into view
                    azResultsSection.scrollIntoView({ behavior: 'smooth' });
                })
                .catch(error => {
                    console.error('Error fetching songs:', error);
                    azResultsTitle.textContent = 'Error searching songs';
                });
        };

        // Add form submit handler
        const form = searchInput.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                performSearch();
            });
        }

        // Add individual handlers
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }
});