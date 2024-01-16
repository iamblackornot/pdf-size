import { round, inchToMM, upperBoundDouble, lowerBoundDouble } from "./misc.js"
import UI, { SnapSlider } from "./ui.js"

const inchSizeSnap = [ 24, 30, 36, 40, 42, 44, 47, 48, 56, 60, 64, 68, 72, 84, 90, 94, 96 ];
const mmWidthSnap = [ 594, 700, 841, 910, 1000 ];
const mmHeightSnap = [ 841, 1000, 1189, 1220, 1400, 2000 ];

export const MIN_PRINT_WIDTH_INCH = inchSizeSnap[0];
export const MIN_PRINT_HEIGHT_INCH = inchSizeSnap[0];

export const MIN_PRINT_WIDTH_MM = mmWidthSnap[0];
export const MIN_PRINT_HEIGHT_MM = mmHeightSnap[0];

export class Poster
{
    constructor(board) {
        
        this.board = board;
        this.isInchUnits = board.isInchUnits;

        UI.setInputValue('poster-width', '');
        UI.setInputValue('poster-height', '');

        UI.disableComponent("slider");
        UI.disableComponent("poster-width");
        UI.disableComponent("poster-height");

        this.slider = new SnapSlider('slider');
        this.slider.subOnChangeEvent(this.onPosterSliderChange.bind(this));
    }
    
    calcMinPrintSize() {

        if(this.board.isInchUnits) {
            this.minPrintingWidth = MIN_PRINT_WIDTH_INCH;
            this.minPrintingHeight = MIN_PRINT_HEIGHT_INCH;
        } else {
            this.minPrintingWidth = MIN_PRINT_WIDTH_MM;
            this.minPrintingHeight = MIN_PRINT_HEIGHT_MM;
        }

        if(this.aspectRatio >= 1) {
            if(this.minPrintingWidth / this.aspectRatio < this.minPrintingHeight) {
                this.minPrintingWidth = round(this.minPrintingHeight * this.aspectRatio, 2);
            }
        } else {
            if(this.minPrintingHeight * this.aspectRatio < this.minPrintingWidth) {
                this.minPrintingHeight = round(this.minPrintingWidth / this.aspectRatio, 2);
            }
        }
    }

    setSource(widthIn, heightIn, base64img) {

        if(this.board.isInchUnits) {
            this.setSize(widthIn, heightIn);
        } else {
            this.setSize(inchToMM(widthIn), inchToMM(heightIn));
        }

        UI.setPosterPreview(base64img);
    }

    setSize(width, height) {

        this.width = width;
        this.height = height;
        this.aspectRatio = this.width / this.height;

        UI.setSpanText('source-poster-width', round(this.width, 2));
        UI.setSpanText('source-poster-height', round(this.height, 2));

        this.calcMinPrintSize();
        this.OnPosterOrBoardSizeChanged();
    }

    OnChangeStub() {

        if(this.aspectRatio >= this.board.aspectRatio) {
            this.slider.setRange( [ this.board.width ] );
        } else {
            this.slider.setRange( [ this.board.height ] );
        }

        this.onPosterSliderChange();
    }

    OnPosterOrBoardSizeChanged() {

        if(!this.aspectRatio) return;

        UI.disableComponent("poster-width");
        UI.disableComponent("poster-height");

        if(!this.board.checkBoardSize()) {

            this.OnChangeStub();
            return; 
        }
        
        if(this.minPrintingWidth > this.board.width || this.minPrintingHeight > this.board.height) {
            UI.notifyError(`poster aspect ratio is too different from the board's one\n`
                    +   `min printing size is ${this.getMinPrintSizeString()}\n`
                    +   `this poster's min size possible is ${this.minPrintingWidth}x${this.minPrintingHeight}`);

            this.OnChangeStub();
            return; 
        }

        UI.resetNotifications();
        
        let values = [];
    
        if(this.aspectRatio >= this.board.aspectRatio) {

            const sizeArr = this.getSizeSnapArr();

            const minIndex = lowerBoundDouble(this.minPrintingWidth, sizeArr);
            const maxIndex = upperBoundDouble(this.board.width, sizeArr);

            values = sizeArr.slice(minIndex, maxIndex);

        } else {
            
            const sizeArr = this.getSizeSnapArr();

            const minIndex = lowerBoundDouble(this.minPrintingHeight, sizeArr);
            const maxIndex = upperBoundDouble(this.board.height, sizeArr);

            values = sizeArr.slice(minIndex, maxIndex);
        }
    
        this.slider.setRange(values);
    
        this.onPosterSliderChange();
    
        UI.showElement("info-container");
        UI.showElement("poster-slider-container");
    }

    getMinPrintSizeString() {
        if(this.board.isInchUnits) return `${MIN_PRINT_WIDTH_INCH}x${MIN_PRINT_HEIGHT_INCH}`;
        return `${MIN_PRINT_WIDTH_MM}x${MIN_PRINT_HEIGHT_MM}`;
    }

    calcHeight(targetWidth) {
        return round(targetWidth / this.aspectRatio, 2);
    }
    calcWidth(targetHeight) {
        return round(targetHeight * this.aspectRatio, 2);
    }

    getSizeSnapArr() {

        if(this.board.isInchUnits) return inchSizeSnap;

        if(this.aspectRatio > this.board.aspectRatio) return mmWidthSnap;

        return mmHeightSnap;
    }

    onPosterSliderChange() {

        const value = this.slider.getValue()
    
        if(this.aspectRatio >= this.board.aspectRatio) {

            const imageWidth = round(value / this.board.width, 2);

            $(`#image`).css('width', `${imageWidth * 100}%`);
            $(`#image`).css('height', 'auto');

            UI.setInputValue('poster-width', value);
            UI.setInputValue('poster-height', round(value / this.aspectRatio, 2));

        } else {

            const imageHeight = Math.round(value * 100 / this.board.height);

            $(`#image`).css('width', 'auto');
            $(`#image`).css('height', `${imageHeight}%`);

            UI.setInputValue('poster-width', round(value * this.aspectRatio, 2));
            UI.setInputValue('poster-height', value);
        }
    
        $(`#image`).css('aspect-ratio', this.aspectRatio.toString());
    };
}