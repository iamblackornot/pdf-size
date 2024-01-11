import UI, { DropDownList } from "./ui.js"
import { Poster } from "./poster.js"
import { inchToMM, mmToInch } from "./misc.js"

const MIN_BOARD_WIDTH_INCH = 24;
const MIN_BOARD_HEIGHT_INCH = 24;

const MAX_BOARD_HEIGHT_INCH = 96;
const MAX_BOARD_WIDTH_INCH = 96;

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
        
        UI.disableComponent('upload');

        UI.setInputValue('board-width-input', '');
        UI.setInputValue('board-height-input', '');

        $("#board-width-input").on("input", this.onBoardInput.bind(this));
        $("#board-height-input").on("input", this.onBoardInput.bind(this));

        this.isInchUnits = true;

        this.poster = new Poster(this);
        this.sizeDropdown = new DropDownList('board-size-dropdown');
        this.unitDropdown = new DropDownList('size-units-dropdown');

        this.sizeDropdown.subOnChangeEvent(this.onSizeSelectionChanged.bind(this));
        this.unitDropdown.subOnChangeEvent(this.onSizeUnitsChanged.bind(this));

        this.populateSizeDropdownList();
        this.sizeDropdown.clearSelection();

        //this.initBoard();
        //this.selectDefaultBoardSize();

        //this.changeSize(width, height);
    }

    initBoard() {

        //$("#board-size-input-container")

        // const dropdown = $('#size-units-dropdown');
        // dropdown[0].selectedIndex = -1;
        //this.populateSizeDropdownList();
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

        UI.enableComponent('upload');
        UI.showElement('onboard-label');
        UI.hideElement('board-tip');

        this.poster.OnPosterOrBoardSizeChanged();
    }

    onBoardInput() {

        if(!UI.checkInput('board-width-input', 'board width', MIN_BOARD_WIDTH_INCH, MAX_BOARD_WIDTH_INCH)) return;
        if(!UI.checkInput('board-height-input', 'board height', MIN_BOARD_HEIGHT_INCH, MAX_BOARD_HEIGHT_INCH)) return;
    
        const width = UI.getInputValue('board-width-input');
        const height = UI.getInputValue('board-height-input');

        this.changeSize(+width, +height);
    }

    onSizeSelectionChanged(event) {

        const sizeArr = this.isInchUnits ? sizesInch : sizesMM;

        if(this.sizeDropdown.getSelectedIndex() === 0) {
            UI.showElement('board-size-input-container');
            UI.enableComponent('board-height-input');
            UI.enableComponent('board-width-input');
            return;
        }

        UI.hideElement('board-size-input-container');
        UI.disableComponent('board-height-input');
        UI.disableComponent('board-width-input');

        const size = sizeArr[this.sizeDropdown.getSelectedIndex() - 1];
        this.changeSize(size.width, size.height);
    }

    populateSizeDropdownList() {

        const sizeArr = this.isInchUnits ? sizesInch : sizesMM;
        this.sizeDropdown.clear();

        this.sizeDropdown.addOption('Custom');

        for (let index = 0; index < sizeArr.length; index++) {
            const desc = sizeArr[index].desc ? ` (${sizeArr[index].desc})` : '';
            this.sizeDropdown.addOption(`${sizeArr[index].width} x ${sizeArr[index].height}${desc}`);
        }
    }

    selectDefaultBoardSize() {
        this.sizeDropdown.setSelectedIndex(this.isInchUnits ? sizesInch.length - 1 : 0);
    }

    selectCustomBoardSize() {
        this.sizeDropdown.setSelectedIndex(0);
    }

    onSizeUnitsChanged(event) {

        this.isInchUnits = this.unitDropdown.getSelectedIndex() === 0;
        const sizeWasSelected = this.sizeDropdown.getSelectedIndex() > -1;

        this.populateSizeDropdownList();
        
        if(!sizeWasSelected) {
            this.sizeDropdown.clearSelection();
            return;
        }

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