import 'App/app/Home.scss';

export default function Home() {
    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-card">
                    <h1>Bienvenue sur la page d'accueil</h1>
                    <p>Ceci est un exercice NextJS - Laravel</p>
                    <p>Vous devrez mettre en place les exercices listés dans le README.md de la racine du répo.</p>
                </div>
                <a href="/admin">Espace Admin</a>
            </div>
        </div>
    )
}