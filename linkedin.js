const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.linkedin.com/login/fr?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin'


const linkedin = {

    browser: null,
    page: null,

    contacts : {

    },

    initialize: async () =>{

        linkedin.browser = await puppeteer.launch({
            headless : false,
            slowMo: 50,
            defaultViewport: null,
            args: ['--start-fullscreen']
        });

        linkedin.page = await linkedin.browser.newPage();
        await linkedin.page.setDefaultTimeout(60000);

        console.log('Navigateur lancé');

    },

    login: async (email, password)=>{

        await linkedin.page.goto(BASE_URL);
        await linkedin.page.waitForSelector("#username");
        
        await linkedin.page.type("#username", email);
        await linkedin.page.type("#password", password);
        await linkedin.page.click('button[type="submit"]');

        await linkedin.page.waitForSelector("input[class='search-global-typeahead__input always-show-placeholder']")

        /*
        await linkedin.page.waitForSelector("#input-5");
        await linkedin.page.waitFor(500);
        */

        console.log( 'Connecté à LinkedIn');

    },

    searchContacts: async (jobAndCompany)=>{

        await linkedin.page.type('input[placeholder="Recherche"]', (jobAndCompany + String.fromCharCode(13)) );
        await linkedin.page.waitFor('h3.search-results__total');
        console.log('Recherche effectuée');

    },

    scrapeContacts: async (emailModel)=>{
        /* Trouver comment détecter prénom et nom car peuvent être inversés, en Caps ou non, seulement l'initiale du nom ...
        Lister les différentes possibilités :
            - Prénom NOM
            - Prénom N.
            - Prénom Nom
            - Prénom NOM1 NOM2     
        */


        console.log('Scrapping démarré')
        let contacts = {}

        // Scrapper la première page, puis : si boutton "Suivant" sans attribut "disabled", click dessus et on recommence, sinon fin du scrapping.
        // Obtenir les infos et les classer dans contacts (check https://www.youtube.com/watch?v=pixfH6yyqZk for help):
        let results = await linkedin.page.evaluate(()=>{
            let currentPageResults = [];
            
            items = document.querySelectorAll('div.search-result__info');

            items.forEach(item=>{
                name = item.querySelector('a').textContent.trim().split('\n')[0];
                console.log(name);
                currentPageResults.push({ name });
            })

            return currentPageResults;

        })

        results.forEach(result=>contacts.result.name = name)

        console.log(contacts);

        return contacts
    }


}


module.exports = linkedin;