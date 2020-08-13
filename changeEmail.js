// USED IF EMAIL NEEDS TO BE CHANGED (email model used not valid , ...)

const fs = require('fs');

let contacts // = ... ;
let emailModel // = ... ;
let newContacts = {};

for (const [key, value] of Object.entries(contacts)) {

        // Obtention de la partie à MàJ et de la Base
    let toUpdate = emailModel.split('@')[0];
    let base = '@' + emailModel.split('@')[1];

        // Obtention du nombre de caractères à récupérer
    let nameChars = toUpdate[toUpdate.indexOf('p')+1];
    let lastNameChars = toUpdate[toUpdate.indexOf('n')+1];

        // Obtention des parties prénom et nom à récupérer
    let namePart = value['name'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').filter(char=>char!==' ' && /^[a-z]+$/i.test(char)).join('');
    let lastNamePart = value['lastName'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').filter(char=>char!==' ' && /^[a-zà-ÿ]+$/i.test(char)).join('');

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

    let email = toUpdate + base;

    newContacts[key] = {
        'name': value['name'],
        'lastName': value['lastName'],
        'job': value['job'],
        'email': email,
        'location': value['location'] 
    }
}

console.log(newContacts);

fs.writeFile('contacts.json', JSON.stringify(newcontacts), (err) => {
    if (err) throw err;
  });