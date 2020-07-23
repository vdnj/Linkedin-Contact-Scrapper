/*let results = await linkedin.page.evaluate(()=>{
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
        return contacts*/

let fullName = 'Valentin DI NATALE';
fullName = fullName.split(' ');
console.log(fullName);

let name = fullName.shift();
console.log(name);

let lastName = fullName.join(' ');
console.log(lastName);