

let name = '';
let lastName = '';
let emailModel = 'p*.n*@eurovia.com'

    // Partie reconstitution de l'email
// Obtention de la partie à MàJ et de la Base
let toUpdate = emailModel.split('@')[0];   // p*.n*
let base = '@' + emailModel.split('@')[1];   // @eurovia.com

    // Obtention du nombre de caractères à récupérer
let nameChars = toUpdate[toUpdate.indexOf('p')+1];   // *
let lastNameChars = toUpdate[toUpdate.indexOf('n')+1];   // *

    // Obtention des parties prénom et nom à récupérer
let namePart = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').filter(char=>char!==' ' && /^[a-z]+$/i.test(char)).join('');   // arnaud
let lastNamePart = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split('').filter(char=>char!==' ' && /^[a-zà-ÿ]+$/i.test(char)).join('');   // hue

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
console.log(toUpdate) 

let email = toUpdate + base;
console.log(email);