import { useEffect, useState } from 'react'

import './App.css'
import axios from 'axios'

function App() {
  const [filmes, setFilmes] = useState([])

  useEffect(() => {
    getMovies()
  }, [])

  const API_KEY = 'sua chave_aqui'; // Substitua pela sua chave da API do TMDb

  const getMovies = async () => {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://api.themoviedb.org/3/movie/popular',
        params: {
          api_key: API_KEY,
          language: 'pt-BR'
        }
      });
      const filmesPopulares = response.data.results;

      // Buscar trailer de cada filme
      const filmesComTrailer = await Promise.all(filmesPopulares.map(async (filme) => {
        try {
          const videoRes = await axios({
            method: 'get',
            url: `https://api.themoviedb.org/3/movie/${filme.id}/videos`,
            params: {
              api_key: API_KEY,
              language: 'pt-BR'
            }
          });
          // Pega o primeiro vídeo do tipo 'Trailer' e site 'YouTube'
          const trailer = videoRes.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
          return {
            ...filme,
            trailerKey: trailer ? trailer.key : null
          };
        } catch (err) {
          return {
            ...filme,
            trailerKey: null
          };
        }
      }));
      setFilmes(filmesComTrailer);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1> CineTrailer</h1>
        <p>Descubra os filmes mais populares e assista aos trailers</p>
      </header>
      
      {filmes.length === 0 ? (
        <div className="loading">
          Carregando filmes populares...
        </div>
      ) : (
        <ul className="movies-grid">
          {filmes.map((filme) => (
            <li key={filme.id} className="movie-card">
              <div className="movie-poster">
                <img 
                  src={`https://image.tmdb.org/t/p/w300${filme.poster_path}`}
                  alt={filme.title}
                />
              </div>
              <div className="movie-content">
                <h2 className="movie-title">{filme.title}</h2>
                <p className="movie-overview">{filme.overview}</p>
                <div className="trailer-container">
                  {filme.trailerKey ? (
                    <iframe
                      className="trailer-iframe"
                      src={`https://www.youtube.com/embed/${filme.trailerKey}`}
                      title={filme.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="no-trailer">Trailer não disponível</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
