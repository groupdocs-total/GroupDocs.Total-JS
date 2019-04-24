import { Selector } from 'testcafe'

export default class CommonTests{
    static async testOpenFileDialogIsShownWhenOpenFileMenuIconClicked(t){
        await t
        .click('#gd-btn-browse')
        .expect(Selector('#modalDialog').visible).ok()
    }
    static async testUploadFileDialogIsShownWhenUploadFileMenuIconClicked(t){
        await t
        .click('#gd-btn-browse')
        .expect(Selector('.gd-upload-dropdown').visible).ok()
    }
}