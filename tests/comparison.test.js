import { Selector } from 'testcafe'
fixture `Comparison E2E tests`
    .page `http://localhost:3000/comparison.html`

test('UI starts without errors', async t => {
    await t
        .expect(1).eql(1)
});
