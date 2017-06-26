import React from 'react';
import SearchBar from './search_bar';
import axios from 'axios';
import Movie from '../partials/movies';
// import {config as env} from 'dotenv';

export default class SearchBarBlock extends React.Component{
  constructor(){
    super();

    this.state = {
      movies: []
    };
  }

_getMovies() {
    return this.state.movies.map((movie) => {
      return(
        <Movie
          movie={movie}
          cast={movie.cast}
          imdb={movie.imdb}
          overview={movie.overview}
          poster_link={movie.poster_link}
          production={movie.production}
          release_date={movie.release_date}
          title={movie.title}
          genres={movie.genres}
          library_id={movie.library_id}
          key={movie.movie_id}
          onDelete={this._deleteMovie.bind(this)}
          onSave={this._saveEdit.bind(this)}/>
      )
    });
  }

  _deleteMovie(movie) {
    axios.delete(`/api/movies/delete/${movie.movie_id}`);

    const movies = [...this.state.movies];
    const movieIndex = movies.indexOf(movie);
    movies.splice(movieIndex, 1);

    this.setState({movies});
  }


  // For editing
 _saveEdit(title, previousData) {
    const library_id = previousData.library_id;

    axios('https://api.themoviedb.org/3/search/movie?api_key='+ process.env.MOVIEDB_APIKEY +'&language=en-US&query=' + title + '&page=1').then((first_movie) => {
          const movie_id = first_movie.data.results[0].id;
          axios('https://api.themoviedb.org/3/movie/' + movie_id + '/credits?api_key='+ process.env.MOVIEDB_APIKEY).then((movie_crew) => {
            let movie_cast = [];
            let movie_production = [];
            for (let i = 0; i < 5; i++) {
              movie_cast.push(movie_crew.data.cast[i]);
            }
            for (let j = 0; j < movie_crew.data.crew.length; j++){
              if(movie_crew.data.crew[j].job === 'Director' || movie_crew.data.crew[j].job === 'Producer'){
                movie_production.push(movie_crew.data.crew[j]);
              }
            }
            axios('https://api.themoviedb.org/3/movie/' + movie_id + '?api_key='+ process.env.MOVIEDB_APIKEY +'&language=en-US').then((movie_info) => {
              const movie_details = movie_info.data;
              const movie_imdb = movie_details.imdb_id;
              const movie_title = movie_details.title;
              const movie_overview = movie_details.overview;
              const movie_poster_path =  movie_details.poster_path;
              const movie_poster_link = 'http://image.tmdb.org/t/p/original/' + movie_poster_path;
              const movie_genres =  movie_details.genres;
              const movie_release_date =  movie_details.release_date;
              const return_movie = {
                cast: movie_cast,
                genres: movie_genres,
                imdb: movie_imdb,
                overview: movie_overview,
                poster_link: movie_poster_link,
                poster_path: movie_poster_path,
                production: movie_production,
                release_date: movie_release_date,
                title: movie_title,
                library_id: library_id
              };
              axios({
                method: 'post',
                url: `/api/movies/edit/${library_id}`,
                data: return_movie
              }).then((updatedMovie) => {
                  const movies = [...this.state.movies];
                  const movieIndex = movies.indexOf(previousData);
                  movies[movieIndex] = updatedMovie.data;

                  this.setState({movies});
              });
            });
          });
        });
  }

  _search(query){
    this.setState({
      movies: []
    });
    axios(`/api/search/${query}`).then((movies)=>{
      movies.data.map((movie)=>{
        axios('https://api.themoviedb.org/3/search/movie?api_key='+ process.env.MOVIEDB_APIKEY +'&language=en-US&query=' + movie.title + '&page=1').then((first_movie) => {
          const movie_id = first_movie.data.results[0].id;
          axios('https://api.themoviedb.org/3/movie/' + movie_id + '/credits?api_key='+ process.env.MOVIEDB_APIKEY).then((movie_crew) => {
            let movie_cast = [];
            let movie_production = [];
            for (let i = 0; i < 5; i++) {
              movie_cast.push(movie_crew.data.cast[i]);
            }
            for (let j = 0; j < movie_crew.data.crew.length; j++){
              if(movie_crew.data.crew[j].job === 'Director' || movie_crew.data.crew[j].job === 'Producer'){
                movie_production.push(movie_crew.data.crew[j]);
              }
            }
            axios('https://api.themoviedb.org/3/movie/' + movie_id + '?api_key='+ process.env.MOVIEDB_APIKEY +'&language=en-US').then((movie_info) => {
              console.log(movie_info);
              const movie_details = movie_info.data;
              const movie_imdb = movie_details.imdb_id;
              const movie_title = movie_details.title;
              const movie_overview = movie_details.overview;
              const movie_poster_path =  movie_details.poster_path;
              const movie_poster_link = 'http://image.tmdb.org/t/p/original/' + movie_poster_path;
              const movie_genres =  movie_details.genres;
              const movie_release_date =  movie_details.release_date;
              const return_movie = {
                cast: movie_cast,
                genres: movie_genres,
                imdb: movie_imdb,
                overview: movie_overview,
                poster_link: movie_poster_link,
                poster_path: movie_poster_path,
                production: movie_production,
                release_date: movie_release_date,
                title: movie_title,
                library_id: movie.movie_id
              };
              return this.setState({
                movies: this.state.movies.concat([return_movie])
              });
            });
          });
        });
      });
    });

  }

  render(){
  	const movies = this._getMovies();

    return (
    	<div>
	    	<SearchBar searchQuery={this._search.bind(this)}/>
	    	<div className="movie-list">{movies}</div>
    	</div>
      )
  }

}