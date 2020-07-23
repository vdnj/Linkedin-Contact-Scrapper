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

    scrapeResults: async (emailModel)=>{
        /* Pour nom prénom trop de possibilités. Partir sur :
        str.split(' ')[0] = prénom, le reste = nom. OK 9 fois sur 10.
        
        Scrapper la première page, puis : si boutton "Suivant" sans attribut "disabled", click dessus et on recommence, sinon fin du scrapping.
        Obtenir les infos et les classer dans contacts (check https://www.youtube.com/watch?v=pixfH6yyqZk for help):
        */

        console.log('Scrapping démarré')
        let contacts = {}
        let counter = 1;

        // Block pour le scrapping d'une page, à intégrer dans une "do while" loop
        
        await linkedin.page.evaluate(()=>{
            document.body.style.zoom = "45%";
            window.scrollBy(0, 175);
        }); // Pour charger l'ensemble de la page
        await linkedin.page.waitFor(1000); 

        let items = await linkedin.page.$$('div.search-result');

        for (const item of items){
            let fullName = await item.$('span.actor-name');
            fullName = await fullName.getProperty('innerText');
            fullName = await fullName.jsonValue();
            fullName = fullName.split(' ');

            let name = fullName.shift();
            let lastName = fullName.join(' ');
  
            let job = await item.$('p.subline-level-1');
            job =  await job.getProperty('innerText');
            job = await job.jsonValue();

            let localisation = await item.$('p.subline-level-2');
            localisation =  await localisation.getProperty('innerText');
            localisation = await localisation.jsonValue();

            let isWorking = true;
            let entreprise = await item.$('p.mt2', {timeout:1000});
            if(entreprise){
                entreprise = await entreprise.getProperty('innerText');
                entreprise = await entreprise.jsonValue();
                if(entreprise.includes('Entreprise précédente')){
                    isWorking = false;
                }
            }

            if(isWorking){
                contacts[counter] = {name, lastName, job, localisation};
                counter ++;
            }

        }

        console.table(contacts);

    }


}


module.exports = linkedin;