const clientID = '<REPLACE_WITH_ACTUAL_CLIENTID>';
const redirectURI = 'http://localhost:3000/';

const Spotify = {
    _headers: {},
    _currentUserProfile: null,
    _accessToken: '',
    _expiresIn: 0,

    get headers() {
        if (!this._accessToken) {
            this._headers = { Authorization: `Bearer ${this.accessToken}` };
        }
        return this._headers;
    },

    set accessToken(token) {
        this._accessToken = token;
    },

    get accessToken() {
        if (!this._accessToken) {
            let accessTokenArray = window.location.href.match(/access_token=([^&]*)/);
            let expiresInArray = window.location.href.match(/expires_in=([^&]*)/);
            if (accessTokenArray && expiresInArray) {

                /* 2nd Condition: URL has been obtained but the accessToken and expiresIn values have not been parsed yet */
                this.accessToken = accessTokenArray[0].split('=')[1];
                this.expiresIn = expiresInArray[0].split('=')[1];
                
                /* Wipe the URL after parsing */
                window.history.pushState('Access Token', null, '/');
            } else {

                /* 3rd Condition: accessToken is empty and not in the URL */
                window.location.assign(`https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`);
                // return this.accessToken;
            }
        }

        /* 1st Condition: The accessToken value has been parsed and has not yet expired */
        return this._accessToken;
    },

    set expiresIn(expiration) {
        this._expiresIn = expiration;

        /* Wipe the accessToken on expiration */
        window.setTimeout(() => this.accessToken = '', this.expiresIn * 1000);
    },

    get expiresIn() {
        return this._expiresIn;
    },

    search(term) {
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: this.headers
        }).then(response => {

            // Handles success
            if (response.ok) {
              return response.json();
            }

            // Handles errors
            throw new Error('Request failed!');
          }, networkError => {
            console.log(networkError.message);
          }).then(jsonResponse => {
            if (jsonResponse.tracks && jsonResponse.tracks.items) {
                return jsonResponse.tracks.items.map(track => {
                  return {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                  };
                });
              } else {
                  return [];
              }
          });
    },

    async getCurrentUserProfile() {
        if (!this._currentUserProfile) {
            try {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: this.headers
                });
    
                // Handles success
                if (response.ok) {
                    const jsonResponse = await response.json();
                    this._currentUserProfile = {
                        birthdate: jsonResponse.birthdate,
                        country: jsonResponse.country,
                        displayName: jsonResponse.display_name,
                        email: jsonResponse.email,
                        externalUrls: jsonResponse.external_urls,
                        followers: jsonResponse.followers,
                        href: jsonResponse.href,
                        id: jsonResponse.id,
                        images: jsonResponse.images,
                        product: jsonResponse.product,
                        type: jsonResponse.type,
                        uri: jsonResponse.uri
                    };
                } else {
                    throw new Error('Request failed!');
                }
            } catch (error) {
                console.log(error);
            }
        }
        return this._currentUserProfile;
    },

    async createPlaylist(name) {
        try {
            const currentUserProfile = await this.getCurrentUserProfile();
            const response = await fetch(`https://api.spotify.com/v1/users/${currentUserProfile.id}/playlists`, {
                headers: this.headers,
                method: 'POST',
                body: JSON.stringify({ name: name }),
            });

            // Handles success
            if (response.ok) {
                const jsonResponse = await response.json();
                return {
                    collaborative: jsonResponse.collaborative,
                    description: jsonResponse.description,
                    externalUrls: jsonResponse.external_urls,
                    followers: jsonResponse.followers,
                    href: jsonResponse.href,
                    id: jsonResponse.id,
                    images: jsonResponse.images,
                    name: jsonResponse.name,
                    owner: jsonResponse.owner,
                    public: jsonResponse.public,
                    snapshotId: jsonResponse.snapshot_id,
                    tracks: jsonResponse.tracks,
                    type: jsonResponse.type,
                    uri: jsonResponse.uri
                };
            }
            throw new Error('Request failed!');
        } catch (error) {
            console.log(error);
        }
    },

    async addTracksToPlaylist(playlistID, trackURIs) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
                headers: this.headers,
                method: 'POST',
                body: JSON.stringify({ uris: trackURIs })
            });

            // Handles success
            if (response.ok) {
                const jsonResponse = await response.json();
                return jsonResponse.snapshot_id;
            }
            throw new Error('Request failed!');
        } catch (error) {
            console.log(error);
        }
    },

    async savePlaylist(name, trackURIs) {
        if (name && trackURIs) {
            this.headers['Content-Type'] = 'application/json';
            const playlist = await this.createPlaylist(name);
            const snapshotId = await this.addTracksToPlaylist(playlist.id, trackURIs)
            console.log('Playlist SnapshotId: ' + snapshotId);
        }
    }
};

export default Spotify;