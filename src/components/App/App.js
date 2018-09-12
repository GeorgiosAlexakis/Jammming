import React, { Component } from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [/*{
        id: 3,
        name: 'Tiny Dancer',
        artist: 'Elton John',
        album: 'Madman Across The Water',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d63'
      }, {
        id: 4,
        name: 'Tiny Dancer',
        artist: 'Tim McGraw',
        album: 'Love Story',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d64'
      }, {
        id: 5,
        name: 'Tiny Dancer',
        artist: 'Rockabye Baby!',
        album: 'Lullaby Renditions of Elton John',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d65'
      }, {
        id: 6,
        name: 'Tiny Dancer',
        artist: 'The White Raven',
        album: 'Tiny Dancer',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d66'
      }, {
        id: 7,
        name: 'Tiny Dancer - Live Album Version',
        artist: 'Ben Folds',
        album: 'Ben Folds Live',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d67'
      }*/],
      playlistName: 'New Playlist',
      playlistTracks: [/*{
        id: 0,
        name: 'Stronger',
        artist: 'Britney Spears',
        album: 'Oops!... I Did It Again',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d60'
      }, {
        id: 1,
        name: 'So Emotional',
        artist: 'Whitney Houston',
        album: 'Whitney',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d61'
      }, {
        id: 2,
        name: 'Its Not Right But Its Okay',
        artist: 'Whitney Houston',
        album: 'My Love Is Your Love',
        uri: 'spotify:track:08td7MxkoHQkXnWAYD8d62'
      }*/]
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let exists = false;
    for (let index = 0; index < this.state.playlistTracks.length && !exists; index++) {
      exists = (this.state.playlistTracks[index].id === track.id);
    }
    if (!exists) {
      let newPlaylistTracks = this.state.playlistTracks;
      newPlaylistTracks.push(track);
      this.setState({playlistTracks: newPlaylistTracks});
    }
  }

  removeTrack(track) {
    let newPlaylistTracks = this.state.playlistTracks.filter(playlistTrack => playlistTrack.id !== track.id);
    this.setState({playlistTracks: newPlaylistTracks});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  savePlaylist() {
    let trackURIs = this.state.playlistTracks.map(playlistTrack => playlistTrack.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.updatePlaylistName('New Playlist');
    this.setState({playlistTracks: []});
  }

  search(term) {
    Spotify.search(term).then(tracks => {
      this.setState({ searchResults: tracks });
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;