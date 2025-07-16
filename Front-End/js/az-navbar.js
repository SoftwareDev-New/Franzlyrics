// az-navbar.js

document.addEventListener('DOMContentLoaded', function () {
    const azNav = document.getElementById('azNav');
    const azDropdown = document.getElementById('azDropdown');
    const resultsSection = document.getElementById('az-results-section');
    const resultsTitle = document.getElementById('az-results-title');
    const resultsList = document.getElementById('azResultsList');
    const welcomeSection = document.querySelector('.welcome-section');
    const hotSongsSection = document.querySelector('.hot-songs');
    let allSongs = [];

    function getBasePath() {
        const path = window.location.pathname;
        // If we're in a lyrics page, we need to go up three levels
        if (path.includes('/lyrics/')) {
            return '../../../';
        }
        // If we're in the html directory
        if (path.includes('/html/')) {
            return '../';
        }
        // If we're in the home page or other pages
        return '';
    }

    function getSongsJsonPath() {
        return getBasePath() + 'data/songs.json';
    }

    fetch(getSongsJsonPath())
        .then(res => {
            if (!res.ok) {
                return { songs: [] };
            }
            return res.json();
        })
        .then(data => {
            allSongs = data.songs || [];
        })
        .catch(error => {
            allSongs = [];
        });

    if (azNav) {
        azNav.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const letter = e.target.getAttribute('data-letter');
                handleAZSelection(letter);
                Array.from(azNav.querySelectorAll('a')).forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    if (azDropdown) {
        azDropdown.addEventListener('change', function (e) {
            const letter = e.target.value;
            handleAZSelection(letter);
        });
    }

    function handleAZSelection(letter) {
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (hotSongsSection) hotSongsSection.style.display = 'none';
        if (resultsSection) {
            const filtered = allSongs.filter(song => 
                song.title && song.title[0].toUpperCase() === letter
            );
            
            if (filtered.length > 0) {
                resultsSection.style.display = 'block';
                if (resultsTitle) resultsTitle.textContent = `Lyrics starting with "${letter}"`;
                
                // Hide share button in privacy page
                const shareButton = document.querySelector('.share-button');
                if (shareButton) {
                    shareButton.style.display = window.location.pathname.includes('privacy.html') ? 'none' : 'block';
                }

                if (resultsList) {
                    resultsList.innerHTML = filtered.map(song => {
                        // Get correct path based on current location
                        const currentPath = window.location.pathname;
                        let basePath = '';
                        
                        // If we're in a lyrics page
                        if (currentPath.includes('/lyrics/')) {
                            const depth = currentPath.split('/').length - currentPath.split('/lyrics/')[0].split('/').length - 1;
                            basePath = '../'.repeat(depth);
                        }
                        // If we're in the html directory
                        else if (currentPath.includes('/html/')) {
                            basePath = '../';
                        }
                        
                        // Clean the song path and ensure it starts without a slash
                        const cleanPath = song.path.replace('/Front-End/', '').replace(/^\//, '');
                        
                        return `<li><a href="${basePath}${cleanPath}">${song.title} - ${song.artist}</a></li>`;
                    }).join('');
                }
            } else {
                resultsSection.style.display = 'none';
            }
        }
    }
    // Remove the conditional so A-Z works everywhere

    const searchContainer = document.querySelector('.search-container');
    const searchToggle = document.querySelector('.search-toggle');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchContainer && searchInput) {
        searchToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });

        document.addEventListener('click', function (e) {
            if (searchContainer.classList.contains('active') && !searchContainer.contains(e.target)) {
                searchContainer.classList.remove('active');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
                searchContainer.classList.remove('active');
            }
        });
    }

    document.querySelector('.search-container').addEventListener('submit', function (e) {
        e.preventDefault();
        const query = document.getElementById('searchInput').value.trim().toLowerCase();

        if (welcomeSection) welcomeSection.style.display = 'none';
        if (hotSongsSection) hotSongsSection.style.display = 'none';

        const results = allSongs.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query)
        );

        resultsList.innerHTML = ''; 
        resultsTitle.textContent = `"${query}" Search Results`;

        if (results.length > 0) {
            // Hide share button in privacy page
            const shareButton = document.querySelector('.share-button');
            if (shareButton) {
                shareButton.style.display = window.location.pathname.includes('privacy.html') ? 'none' : 'block';
            }

            results.forEach(song => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                
                // Correctly determine the relative path
                const songPath = song.path.startsWith('/Front-End/') ? song.path.substring('/Front-End/'.length) : song.path;
                
                // Calculate the correct base path
                let basePath = '';
                const currentPath = window.location.pathname;
                
                // If we're in a lyrics page
                if (currentPath.includes('/lyrics/')) {
                    const depth = currentPath.split('/').length - currentPath.split('/lyrics/')[0].split('/').length - 1;
                    basePath = '../'.repeat(depth);
                }
                // If we're in the html directory
                else if (currentPath.includes('/html/')) {
                    basePath = '../';
                }
                
                link.href = `${basePath}${songPath}`;
                link.textContent = `${song.title} - ${song.artist}`;
                
                li.appendChild(link);
                resultsList.appendChild(li);
            });
            resultsSection.style.display = 'block';
        } else {
            resultsList.innerHTML = '<li>No results found.</li>';
            resultsSection.style.display = 'block';
        }
    });

    document.getElementById('azDropdown').addEventListener('change', function(e) {
        if (e.target.value) {
            window.location.href = e.target.value;
        }
    });
});