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

    login: async ({email, password})=>{

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

    searchContacts: async ({job, company})=>{

        await linkedin.page.type('input[placeholder="Recherche"]', (job + ' ' + company + String.fromCharCode(13)) );
        await linkedin.page.waitFor('h3.search-results__total');
        console.log('Recherche effectuée');

    },

    scrapeResults: async ({emailModel, company})=>{

        console.log('Scrapping démarré')
        let contacts = {}
        let counter = 1;
        
        let isNextPage = true;
        while(isNextPage){

            await linkedin.page.evaluate(()=>{
                document.body.style.zoom = "45%";
                window.scrollBy(0, 175);
            }); // Pour charger l'ensemble de la page
            await linkedin.page.waitFor(1000); 
    
            let items = await linkedin.page.$$('div.search-result');
    
            for (const item of items){
    
                // Partie Prénom + Nom
                let fullName = await item.$('span.actor-name');
                fullName = await fullName.getProperty('innerText');
                fullName = await fullName.jsonValue();
                fullName = fullName.split(' ');
                if(fullName==='Utilisateur LinkedIn'){
                    return;
                }
    
                let name = fullName.shift();
                let lastName = fullName.join(' ');
      
                // Partie Job
                let job = await item.$('p.subline-level-1');
                job =  await job.getProperty('innerText');
                job = await job.jsonValue();
    
                // Partie Localisation
                let location = await item.$('p.subline-level-2');
                location =  await location.getProperty('innerText');
                location = await location.jsonValue();
    
                // Partie 'Toujours en poste'
                let isWorking = false;
                let entreprise = await item.$('p.mt2', {timeout:1000});
                if(entreprise){
                    entreprise = await entreprise.getProperty('innerText');
                    entreprise = await entreprise.jsonValue();
                    if(entreprise.toLowerCase().includes('actuelle') && entreprise.toLowerCase().includes(company.toLowerCase())){
                        isWorking = true;
                    }
                }
                if(job.toLowerCase().includes(company.toLowerCase())){
                    isWorking = true;
                }
    
                // Partie reconstitution de l'email
                    // Obtention de la partie à MàJ et de la Base
                let toUpdate = emailModel.split('@')[0];
                let base = '@' + emailModel.split('@')[1];

                    // Obtention du nombre de caractères à récupérer
                let nameChars = toUpdate[toUpdate.indexOf('p')+1];
                let lastNameChars = toUpdate[toUpdate.indexOf('n')+1];

                    // Obtention des parties prénom et nom à récupérer
                let namePart = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').filter(char=>char!==' ' && /^[a-z]+$/i.test(char)).join('');
                let lastNamePart = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').filter(char=>char!==' ' && /^[a-zà-ÿ]+$/i.test(char)).join('');
                
                if(Number(nameChars)){
                    nameChars = Number(nameChars);
                    namePart = namePart.substr(0, nameChars);
                }
                if(Number(lastNameChars)){
                    lastNameChars = Number(lastNameChars);
                    lastNamePart = lastNamePart.substr(0, lastNameChars);
                }
                
                    // Remplacement du prénom et du nom
                toUpdate = toUpdate.replace(('p'+ toUpdate[toUpdate.indexOf('p')+1]), namePart);
                toUpdate = toUpdate.replace(('n'+ toUpdate[toUpdate.indexOf('n')+1]), lastNamePart);

                let email = toUpdate + base;

                // Partie assignation des résultats obtenus 
                if(isWorking && lastName !== 'LinkedIn'){
                    contacts[counter] = {name, lastName, job, email, location};
                    counter ++;
                }
    
            }
    
            isNextPage = await linkedin.page.evaluate(()=>{
                let suivant = document.querySelector('button[aria-label="Suivant"]');
                if(suivant){
                    if(!suivant.hasAttribute('disabled')){
                        suivant.click();
                        return true;
                    }
                }
                return false;
            });
            await linkedin.page.waitFor(2000);

        }

        console.log('Scrapping terminé. ' + counter + ' contacts obtenus')
        console.table(contacts);
        return contacts;

    }


}


module.exports = linkedin;