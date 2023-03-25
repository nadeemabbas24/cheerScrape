import { load } from 'cheerio';
import axios from 'axios';
import { writeFile } from 'fs';
import puppeteer from 'puppeteer';

(async ()=>{
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://github.com/trending');

  // Click on the "Developers" tab
  await page.click('a[href="/trending/developers"]');
  // Wait for the page to load
  await page.waitForNavigation();
   // Select the "JavaScript" language filter

   await page.screenshot({path :'screenshot.png'});
     
  // Extract the developer information
  const developerInfo = await page.evaluate(() => {
    
    const devs = [];
    const devNodes = document.querySelectorAll('.Box-row');
    devNodes.forEach(node => {
      const name = node.querySelector('.h3 a').innerText.trim();
      const username = node.querySelector('.h3 a').getAttribute('href').substr(1);
      const repo = node.querySelector('.h4 a').innerText.trim();
      const description = node.querySelector('.col-9')?.lastElementChild?.innerText.trim() || '';

      devs.push({ name, username, repo, description });
    });
    return devs;
  });

  console.log(developerInfo);
  // Write to a file
 
  writeFile('github_developers.json', JSON.stringify(developerInfo), (err)=>{
    if(err)
     console.log(err);
  });

  await browser.close();
})();

axios.get('https://github.com/trending')
  .then((response) => {
    const html = response.data;
    const $ = load(html);
    const repos = [];

    $('.Box .Box-row').each((i, element) => {
      const title = $(element).find('h1 a').text().trim();
      const description = $(element).find('p').text().trim();
      const url = 'https://github.com' + $(element).find('h1 a').attr('href');
      const stars = $(element).find('svg[aria-label="star"]').parent().text().trim().replace(',', '');
      const forks = $(element).find('svg[aria-label="fork"]').parent().text().trim().replace(',', '');
      const language = $(element).find('[itemprop="programmingLanguage"]').text().trim();

      const repo = {
        title,
        description,
        url,
        stars,
        forks,
        language
      };

      repos.push(repo);
    });

    const data ={"repositories" : repos}

    writeFile('data.json', JSON.stringify(data), (err) => {
      if (err) throw err;
      console.log('Data written to file');
      console.log(repos);
    });
  })
  .catch((error) => {
    console.log(error);
  });
