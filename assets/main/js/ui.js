import { isNumber } from "./misc.js";

export default class UI
{
    static changeComponentText(id, text) {
        $(`#${id}`).text(text);
    }
    
    static setInputValue(id, value) {
        $(`#${id}`).val(value);
    }
    
    static getInputValue(id) {
        return $(`#${id}`).val();
    }
    
    static notify(text = '') {
        this.changeComponentText('notify', text);
        $("#notify").css('color', 'black')
    }
    
    static notifyError(text = '') {
        this.changeComponentText('notify', text);
        $("#notify").css('color', 'red')
    }
    
    static disableComponent(id) {
        $(`#${id}`).attr('disabled', true); 
    }

    static enableComponent = (id) => {
        $(`#${id}`).removeAttr('disabled');
    }

    static setUIUploadStart() {
        this.notify();
        this.disableComponent("upload");
        $('#upload').attr('value', 'working...');
    }
    
    static setUIUploadCompleted() {
        this.enableComponent("upload");
        $('#upload').attr('value', 'Upload');
    }

    static highlightInputError(id, enable = true) {
        $(`#${id}`).css('background-color', enable ? 'lightpink' : "");
    }
    
    static showInputError(id, message = "", enable = true) {
        enable ? this.notifyError(`${message}`) : this.notify();
        this.highlightInputError(id, enable);
    }
    
    static hideInputError(id) {
        this.showInputError(id, "", false);
    }

    static resetNotifications() {
        this.hideInputError('width');
        this.hideInputError('height');
    }
    
    static setPosterPreview(base64img) {
        this.hideElement('onboard-label');
        $("#image").attr('src', 'data:image/png;base64,' + base64img);
    }

    static showElement(id) {
        $(`#${id}`).css('display', '');
    }

    static hideElement(id) {
        $(`#${id}`).css('display', 'none');
    }
    
    static checkInput(id, desc, minValue, maxValue) {

        const value = UI.getInputValue(id);
    
        if(!isNumber(value)) {
            this.showInputError(id, 'not a number');
            return false;
        }
    
        if(value < minValue) {
            this.showInputError(id, `minimum ${desc} is ${minValue}`);
            return false;
        }
    
        if(value > maxValue) {
            this.showInputError(id, `maximum ${desc} is ${maxValue}`);
            return false;
        }
    
        this.hideInputError(id);
        return true;
    }

    static setSliderRange(id, min, max) {
        $(`#${id}`).attr('min', min);
        $(`#${id}`).attr('max', max);

        if(min >= max) {
            UI.setInputValue('slider', 50);
            //UI.disableComponent('slider');
            return;
        }

       // UI.enableComponent('slider');
    }
    static setSpanText(id, text) {
        $(`#${id}`).text(text);
    }
}

export class DropDownList {

    constructor(id) {
        this.dropdown = $(`#${id}`);
    }

    addOption(text) {
        this.dropdown.append(`<option>${text}</option>`);
    }
    clear() {
        this.dropdown.empty();
    }
    getSelectedIndex() {
        return this.dropdown[0].selectedIndex;
    }
    setSelectedIndex(index) {

        if(index < 0) return;

        this.dropdown[0].selectedIndex = index;
        this.dropdown.trigger('change');
    }
    clearSelection() {
        this.dropdown[0].selectedIndex = -1;
    }
    subOnChangeEvent(delegate) {
        this.dropdown.on('change', delegate);
    }
}