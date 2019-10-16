const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless:true,
            args: ['--no-sandbox']//coz Travis will assign virtual machine setting which makes the test take more time to run,
            //by putting --no-sandbox flag, the setting config can be skipped
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);
        
        console.log(session, sig);
    
        await this.page.setCookie({name: 'session', value: session});
        await this.page.setCookie({name: 'session.sig', value: sig});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');//wait for the component to finish loading
    
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate( (pathArg) =>{
            return fetch(pathArg, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        }, path);
    }

    post(path, data) {
        return this.page.evaluate((pathArg, dataArg)=>{
            return fetch(pathArg, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataArg)
            }).then(res => res.json()); // fetch returns raw data instead of json
        }, path, data);
    }

    execRequests(actions) {
        return Promise.all( // return all results as a single promise
            actions.map(({method, path, data}) => {
                return this[method](path, data); // data will be undefine for GET 
            })
        );
    }
}

module.exports = CustomPage;