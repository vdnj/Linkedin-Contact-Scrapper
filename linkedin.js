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

        //Replace placeholder by Recherche
        try{
            await linkedin.page.type('input[placeholder="Recherche"]', (job + ' ' + company + String.fromCharCode(13)) );
        } catch(e){
            await linkedin.page.type('input[placeholder="Chercher une personne, un poste, du contenu"]', (job + ' ' + company + String.fromCharCode(13)) );
        }
        await linkedin.page.waitFor('h3.search-results__total');
        console.log('Recherche effectuée');

    },

    applyFilters: async ({filters})=>{

        // Click sur le boutton filtre 'Entreprise Actuelle'
        let entrActBtn = await linkedin.page.$('button[aria-controls="entreprises-actuelles-facet-values"]');
        await entrActBtn.click();
        await linkedin.page.waitForSelector('input[placeholder="Ajouter une entreprise actuelle"]');

        // Plusieurs listes sur la page avec la même classe (1 seule est visible et nous intéresse)
        let lists = await linkedin.page.$$('ul.search-s-facet__list.pt3.ember-view');
        let list = lists[lists.length-1];

        // Selection des propositions en fonction des filtres choisis
        let items = await list.$$('label');
        
        itemsToClick = filters.split(' ');
        for (const item of itemsToClick){
            await items[Number(item)-1].click();
        }

        let appliquerBtn = await linkedin.page.$$('button[data-control-name="filter_pill_apply"]');
        appliquerBtn = appliquerBtn[appliquerBtn.length-1];
        await appliquerBtn.click();
        await linkedin.page.waitFor(3000);
        console.log('Filtre(s) appliqué(s)');

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
                
                    // Remplacement du prénom
                toUpdate = toUpdate.replace(('p'+ toUpdate[toUpdate.indexOf('p')+1]), namePart);

                    // Checker où se trouve le n à remplacer pour ne pas remplacer un du prénom
                let nToReplaceIndex = toUpdate.split('').findIndex(char=>{
                    return (char === '*' || Number(char))
                })
                nToReplaceIndex --;

                    // Remplacement du nom
                toUpdate = toUpdate.replace((toUpdate[nToReplaceIndex]+ toUpdate[nToReplaceIndex+1]), lastNamePart);

                    // Reconstitution
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

        console.log('Scrapping terminé. ' + (counter-1) + ' contacts obtenus')
        console.table(contacts);
        return contacts;

    },

    disconnect : async () =>{

        await linkedin.page.goto('https://www.linkedin.com/m/logout/');
        await linkedin.page.waitFor(3000);
        await linkedin.browser.close();
        console.log('Déconnecté de Linkedin, navigateur fermé');

    }


}


module.exports = linkedin;