
const Page = require('./helpers/page');

let page;

beforeEach(async ()=>{
    page = await Page.build();

    await page.goto('http://localhost:3000');
});

test('testing ', ()=> {
    const sum = 1+2;

    expect(sum).toEqual(3);
});

afterEach(async ()=>{
    await page.close();
});

//test.only: run the test only, if no test.only is marked, all tests are run

test('has correct header text', async ()=>{

    //puppeteer: serialize the code into text and send to browser, then parse back to js and evaluate in browser
    // ie serialize el => el.innerHTML into text
    const brandText = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(brandText).toEqual('Blogster');
});

test('click logon async flow', async ()=>{
    await page.click('#authHref');
    const url = await page.url();
    console.log(url);

    expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in, show logout button', async() =>{
    const id = '5d878b6fecac220d500201ea';
    await page.login();

    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
});

test.only('header has correct text', async() => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});