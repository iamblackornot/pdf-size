import { round, inchToMM, mmToInch } from "./misc.js"
import UI from "./ui.js"
import board from "./board.js"

export const MIN_PRINT_WIDTH_INCH = 10;
export const MIN_PRINT_HEIGHT_INCH = 10;

export class Poster
{
    constructor(board) {
        
        this.board = board;
        this.isInchUnits = board.isInchUnits;

        UI.setInputValue('slider', 50);
        UI.setInputValue('poster-width', '');
        UI.setInputValue('poster-height', '');

        UI.disableComponent("slider");
        UI.disableComponent("poster-width");
        UI.disableComponent("poster-height");

        UI.hideElement("info-container");
        UI.hideElement("poster-slider-container");

        $("#slider").on("input", this.onPosterSliderChange.bind(this));
        $("#poster-width").on("input", this.onPosterWidthInput.bind(this));
        $("#poster-height").on("input", this.onPosterHeightInput.bind(this));

    }
    
    calcMinPrintSize() {

        if(this.board.isInchUnits) {
            this.minPrintingWidth = MIN_PRINT_WIDTH_INCH;
            this.minPrintingHeight = MIN_PRINT_HEIGHT_INCH;
        } else {
            this.minPrintingWidth = inchToMM(MIN_PRINT_WIDTH_INCH);
            this.minPrintingHeight = inchToMM(MIN_PRINT_HEIGHT_INCH);
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

    OnPosterOrBoardSizeChanged() {

        if(!this.aspectRatio) return;

        UI.disableComponent("slider");
        UI.disableComponent("poster-width");
        UI.disableComponent("poster-height");
        
        if(this.minPrintingWidth > this.board.width || this.minPrintingHeight > this.board.height) {
            UI.notifyError(`poster aspect ratio is too different from the board's one\n`
                    +   `min printing size is ${MIN_PRINT_WIDTH_INCH}x${MIN_PRINT_HEIGHT_INCH}\n`
                    +   `this poster's min size possible is ${this.minPrintingWidth}x${this.minPrintingHeight}`);

            let minSliderValue = 0;
            let maxSliderValue = 0;

            if(this.aspectRatio >= this.board.aspectRatio) {
                minSliderValue = this.board.width;
                maxSliderValue = this.board.width;
            } else {
                minSliderValue = this.board.height;
                maxSliderValue = this.board.height;
            }

            UI.setSliderRange("slider", minSliderValue, maxSliderValue);
            UI.setInputValue('slider', 50);
            this.onPosterSliderChange();

            return; 
        }

        UI.resetNotifications();
        
        let minSliderValue = 0;
        let maxSliderValue = 0;
    
        if(this.aspectRatio >= this.board.aspectRatio) {
            minSliderValue = this.minPrintingWidth, this.board.width;
            maxSliderValue = this.board.width;
        } else {
            minSliderValue = this.minPrintingHeight, this.board.height;
            maxSliderValue = this.board.height;
        }
    
        UI.setSliderRange("slider", minSliderValue, maxSliderValue);
        UI.setInputValue('slider', maxSliderValue);
    
        this.onPosterSliderChange();
    
        UI.enableComponent("slider");
        UI.enableComponent("poster-width");
        UI.enableComponent("poster-height");

        UI.showElement("info-container");
        UI.showElement("poster-slider-container");
    }

    calcHeight(targetWidth) {
        return round(targetWidth / this.aspectRatio, 2);
    }
    calcWidth(targetHeight) {
        return round(targetHeight * this.aspectRatio, 2);
    }

    onPosterSliderChange() {

        const value = UI.getInputValue('slider');
    
        if(this.aspectRatio >= this.board.aspectRatio) {

            const imageWidth = round(value / this.board.width, 2);
            //const imageHeight = round(imageWidth / this.aspectRatio, 2);

            $(`#image`).css('width', `${imageWidth * 100}%`);
            $(`#image`).css('height', 'auto');

            UI.setInputValue('poster-width', value);
            UI.setInputValue('poster-height', round(value / this.aspectRatio, 2));
        } else {

            const imageHeight = Math.round(value * 100 / this.board.height);
            //const imageWidth = round(imageHeight * this.aspectRatio, 2);

            $(`#image`).css('width', 'auto');
            $(`#image`).css('height', `${imageHeight}%`);

            UI.setInputValue('poster-width', round(value * this.aspectRatio, 2));
            UI.setInputValue('poster-height', value);
        }
    
        $(`#image`).css('aspect-ratio', this.aspectRatio.toString());
    };
    
    onPosterWidthInput() {
    
        if(!UI.checkInput('poster-width', 'poster width', this.minPrintingWidth, this.board.width)) return;
    
        const width = UI.getInputValue('poster-width');
        const height = round(width / this.aspectRatio, 2);
    
        UI.setInputValue('poster-height', height);
    
        if(!UI.checkPosterHeightValue()) return;
    
        UI.setInputValue('slider', this.aspectRatio > 0 ? width : height);
    
        this.onPosterSliderChange();
    }
    
    onPosterHeightInput() {
    
        if(!UI.checkInput('poster-height', 'poster height', this.minPrintingHeight, this.board.height)) return;
    
        const height = UI.getInputValue('poster-height');
        const width = round(height * this.aspectRatio, 2);
    
        UI.setInputValue('poster-width', width);
    
        if(!UI.checkPosterWidthValue()) return;
    
        UI.setInputValue('slider', this.aspectRatio > 0 ? width : height);
    
        this.onPosterSliderChange();
    }
}



// var currPoster = new Poster(MIN_PRINT_WIDTH, MIN_PRINT_HEIGHT);
// export default currPoster;

//export default new Poster(MIN_PRINT_WIDTH, MIN_PRINT_HEIGHT);
