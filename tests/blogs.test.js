const Page = require('./helpers/page');

let page;

beforeEach(async() =>{
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('when log in', async()=>{
    beforeEach( async()=>{
        await page.login();
        await page.click('a.btn-floating');
    })

    test('can see blog create form', async()=> {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('and use invalid inputs', async()=>{
        beforeEach(async()=>{
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'my content');
            await page.click('form button');
        });

        test('submitting takes user to review screen', async()=>{
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries');

        });

        test('submitting then saving adds blog to index page', async()=>{
            await page.click('#emailBtn');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('my content');
        });
    });
    describe('and use invalid inputs', async()=>{
        beforeEach(async()=>{
            await page.click('form button');
        });

        test('form shows on err msg', async()=>{
            const titleErr = await page.getContentsOf('.title .red-text');
            const contentErr = await page.getContentsOf('.content .red-text');

            expect(titleErr).toEqual('You must provide a value');
            expect(contentErr).toEqual('You must provide a value');
        })

    });
});

describe('user is not logged in', async()=>{
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {title:'My Title', content: 'My Content'}
        }
    ];

    test('blog\'s related actions are prohibited', async()=>{
       const results = await page.execRequests(actions);

       for(let result of results) {
        expect(result).toEqual({ error: 'You must log in!'});
       }
    });

    // test set without grouping:
        // test('user cannot create blog posts', async()=>{
        //     const result = await page.post('/api/blogs', {title:'My Title', content: 'My Content'})

        //     expect(result).toEqual({ error: 'You must log in!'});
        // });

        // test('user cannot read blogs', async()=>{
        //     const result = await page.get('/api/blogs');


        //     expect(result).toEqual({ error: 'You must log in!'});
        // });
});

