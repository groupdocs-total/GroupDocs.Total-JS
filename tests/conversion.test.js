import { Selector } from 'testcafe'
import CommonTests from './common'
fixture `Conversion E2E tests`
    .page `http://localhost:3000/conversion.html`

test('UI starts without errors', async t => {
    await t
        .expect(1).eql(1)
});

test('When open file tool is clicked open file dialog is displayed', CommonTests.testOpenFileDialogIsShownWhenOpenFileMenuIconClicked)
test('When upload file tool is clicked upload file dialog is displayed', CommonTests.testUploadFileDialogIsShownWhenUploadFileMenuIconClicked)