import UI from "./ui.js"
import { Poster } from "./poster.js"
import { inchToMM, mmToInch } from "./misc.js"

const MIN_BOARD_WIDTH_INCH = 10;
const MIN_BOARD_HEIGHT_INCH = 10;

const MAX_BOARD_HEIGHT_INCH = 500;
const MAX_BOARD_WIDTH_INCH = 500;

const sizesInch = 
[
    { "width": 40, "height": 30 },
    { "width": 48, "height": 36 },
    { "width": 56, "height": 36 },
    { "width": 60, "height": 36 },
    { "width": 72, "height": 36 },
    { "width": 96, "height": 36 },
    { "width": 60, "height": 42 },
    { "width": 72, "height": 42 },
    { "width": 90, "height": 42 },
    { "width": 44, "height": 44 },
    { "width": 48, "height": 48 },
    { "width": 72, "height": 48 },
    { "width": 96, "height": 48 },
];

const sizesMM = 
[
    { "width": 841, "height": 1189, "desc": "A0" },
    { "width": 594, "height": 841, "desc": "A1" },
    { "width": 700, "height": 1000 },
    { "width": 1000, "height": 1000 },
    { "width": 910, "height": 1220 },
    { "width": 1000, "height": 1400 },
    { "width": 1000, "height": 2000 },
];

export class Board
{
    constructor() {

        UI.disableComponent('board-height-input');
        UI.disableComponent('board-width-input');
        
        $("#board-width-input").on("input", this.onBoardWidthInput.bind(this));
        $("#board-height-input").on("input", this.onBoardHeightInput.bind(this));
        $('#board-size-dropdown').on('change', this.onSizeSelectionChanged.bind(this));
        $('#size-units-dropdown').on('change', this.onSizeUnitsChanged.bind(this));


        this.poster = new Poster(this);
        this.isInchUnits = true;

        this.populateSizeDropdownList();
        this.selectDefaultBoardSize();

        //this.changeSize(width, height);
    }

    changeSize(width, height) {
        
        this.width = width;
        this.height = height;
        this.aspectRatio = this.width / this.height;

        UI.setSpanText('board-width', this.width);
        UI.setSpanText('board-height', this.height);

        UI.setInputValue('board-width-input', this.width);
        UI.setInputValue('board-height-input', this.height);

        if(this.aspectRatio >= 1) {
            $(`#board`).css('width', '100%');
            $(`#board`).css('height', 'auto');
        } else {
            $(`#board`).css('width', 'auto');
            $(`#board`).css('height', '100%');
        }

        $(`#board`).css('aspect-ratio', this.aspectRatio.toString());
        $('.units').text(this.isInchUnits ? "in" : "mm");

        this.poster.OnPosterOrBoardSizeChanged();
    }


    onBoardWidthInput() {

        if(!UI.checkInput('board-width-input', 'board width', MIN_BOARD_WIDTH_INCH, MAX_BOARD_WIDTH_INCH)) return;
    
        const width = UI.getInputValue('board-width-input');
        this.changeSize(+width, this.height);
    }
    
    onBoardHeightInput() {
    
        if(!UI.checkInput('board-height-input', 'board height', MIN_BOARD_HEIGHT_INCH, MAX_BOARD_HEIGHT_INCH)) return;
    
        const height = UI.getInputValue('board-height-input');
        this.changeSize(this.width, +height);
    }

    onSizeSelectionChanged(event) {

        const dropdown = event.target;
        const sizeArr = this.isInchUnits ? sizesInch : sizesMM;

        if(dropdown.selectedIndex == sizeArr.length) {
            UI.showElement('board-size-input-container');
            UI.enableComponent('board-height-input');
            UI.enableComponent('board-width-input');
            return;
        }

        UI.hideElement('board-size-input-container');
        UI.disableComponent('board-height-input');
        UI.disableComponent('board-width-input');

        const size = sizeArr[dropdown.selectedIndex];
        this.changeSize(size.width, size.height);
    }

    populateSizeDropdownList() {

        const sizeArr = this.isInchUnits ? sizesInch : sizesMM;
        const dropdown = $('#board-size-dropdown');

        dropdown.empty();

        for (let index = 0; index < sizeArr.length; index++) {
            const desc = sizeArr[index].desc ? ` (${sizeArr[index].desc})` : '';
            dropdown.append(`<option>${sizeArr[index].width} x ${sizeArr[index].height}${desc}</option>`);
        }

        dropdown.append('<option>Custom</option>');
    }

    selectDefaultBoardSize() {

        const dropdown = $('#board-size-dropdown');
        dropdown[0].selectedIndex = this.isInchUnits ? sizesInch.length - 1 : 0;
        dropdown.trigger('change');
    }

    selectCustomBoardSize() {
        const dropdown = $('#board-size-dropdown');
        dropdown[0].selectedIndex = this.isInchUnits ? sizesInch.length : sizesMM.length;
        dropdown.trigger('change');
    }

    onSizeUnitsChanged(event) {
        this.isInchUnits = event.target.selectedIndex == 0;
        this.populateSizeDropdownList();
        this.selectCustomBoardSize();

        const convertFunc = this.isInchUnits ? mmToInch : inchToMM;

        this.changeSize(convertFunc(this.width), convertFunc(this.height));
        this.poster.setSize(convertFunc(this.poster.width), convertFunc(this.poster.height));
    }

    setPosterSource(widthIn, heightIn, base64img) {
        UI.hideElement('onboard-label');
        this.poster.setSource(widthIn, heightIn, base64img);
    }
}



const currBoard = new Board();
export default currBoard;

//export default new Board(MIN_BOARD_WIDTH, MIN_BOARD_HEIGHT);