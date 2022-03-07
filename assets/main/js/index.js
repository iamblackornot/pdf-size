initComponents = () => {
    setInputValue('slider', 50);
    $('#board-width').text(boardWidth);
    $('#board-height').text(boardHeight);

    disableComponent("slider");
    disableComponent("width");
    disableComponent("height");

    $("#slider").on("input", OnSliderChange);
    $("#width").on("input", onWidthInput);
    $("#height").on("input", onHeightInput);
}

changeComponentText = (id, text) => {
    $(`#${id}`).text(text);
}

setInputValue = (id, value) => {
    $(`#${id}`).val(value);
}

getInputValue = (id) => {
    return $(`#${id}`).val();
}

notify = (text = '') => {
    changeComponentText('notify', text);
    $("#notify").css('color', 'black')
}

notifyError = (text = '') => {
    changeComponentText('notify', text);
    $("#notify").css('color', 'red')
}

disableComponent = (id) => {
    $(`#${id}`).attr('disabled', true); 
}
enableComponent = (id) => {
    $(`#${id}`).removeAttr('disabled');
}

function isNumber(num){
    return !isNaN(+ num)
}

setUIUploadStart = () => {
    notify();
    disableComponent("upload");
    $('#upload').attr('value', 'working...');
}

setUIUploadCompleted = () => {
    enableComponent("upload");
    $('#upload').attr('value', 'Upload');
}

$('form').on('submit', function (e) {

    setUIUploadStart();
    e.preventDefault();

    var reader = new FileReader(),
        file = $('#browse')[0];

    if (!file.files.length) {
        notifyError('no file uploaded');
        return false;
    }

    reader.onload = function () {
        var data = reader.result,
            base64 = data.replace(/^[^,]*,/, ''),
            info = {
                pdf: base64
            };

        //console.log('data = ', data)
        //console.log('reader onload');

        Promise.resolve(
            $.ajax({
                url: serverURL,
                type: "POST",
                dataType: "JSON",
                data: info,
                complete: () => { setUIUploadCompleted(); },
            })
        ).then(onRequestSuccess)
         .catch(onRequestError);
    };

    reader.readAsDataURL(file.files[0]);
});

onRequestSuccess = (res) => {
    if(showPosterPreview(res.base64image, res.width, res.height)) {
        resetNotifications();
        enableComponent("slider");
        enableComponent("width");
        enableComponent("height");
        
        $('#pdf-width').text(round(res.width, 2));
        $('#pdf-height').text(round(res.height, 2));
    }
    //console.log(response);
}

onRequestError = (jqXHR) => { 

    let errMessage;

    if(jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error) {
        errMessage = jqXHR.responseJSON.error;
    } else {
        errMessage = jqXHR.statusText;
    }

    //console.log(jqXHR);
    console.log('error: ', errMessage);
    notifyError(errMessage);
};

const boardWidth = 96;
const boardHeight = 48;

const minPrintingWidth = 1;
const minPrintingHeight = 1;

let ratio = 1;
let useWidth = true;
let minPrintSize = minPrintingWidth;

calcPDFSize = (width, height, minPrintSize) => {

    if(useWidth) {

        if(width > boardWidth) return boardWidth;
        if(width < minPrintSize) return minPrintSize;

        return width;
    } else {

        if(height > boardHeight) return boardHeight;
        if(height < minPrintSize) return minPrintSize;

        return height;
    }
}

calcPrintMinSize = (useWidth, ratio) => {

    if(useWidth) {
        if(minPrintingWidth / ratio < minPrintingHeight) {
            const newWidth = round(minPrintingHeight * ratio, 2);
            if(newWidth <= boardWidth) {
                return newWidth;
            } else {
                return 0;
            }
        } else {
            return minPrintingWidth;
        }
    } else {
        if(minPrintingHeight * ratio < minPrintingWidth) {
            const newHeight = round(minPrintingWidth / ratio, 2);
            if(newHeight <= boardHeight) {
                return newHeight;
            } else {
                return 0;
            }
        } else {
            return minPrintingHeight;
        }
    }
}

setInputs = (pdfSize) => {
    const width = useWidth ? pdfSize : round(pdfSize * ratio, 2);
    const height = !useWidth ? pdfSize : round(pdfSize / ratio, 2);
    
    setInputValue('width', width);
    setInputValue('height', height);
}

showPosterPreview = (base64img, width, height) => {

    newUseWidth = width / height >= boardWidth / boardHeight;
    newRatio = width / height; 
    minPrintSize = calcPrintMinSize(newUseWidth, newRatio);  

    if(minPrintSize === 0) {
        notifyError('pdf size is not supported (pdf width/height ratio is too large or too small)');
        return false;
    }

    $("#image").attr('src', 'data:image/png;base64,' + base64img);

    useWidth = newUseWidth;
    ratio = newRatio;
    const pdfSize = calcPDFSize(width, height, minPrintSize);
    const boardMaxSize = useWidth ? boardWidth : boardHeight; 

    $("#slider").attr('min', minPrintSize);
    $("#slider").attr('max', boardMaxSize);
    setInputValue('slider', pdfSize);

    setInputs(pdfSize);

    OnSliderChange();

    return true;
}



OnSliderChange = () => {

    const value = getInputValue('slider');

    if(useWidth) {
        const imageWidth = Math.round(value / boardWidth * $("#board").width());
        $("#image").width(imageWidth);
        $("#image").height(Math.round(imageWidth / ratio));
    } else {
        const imageHeight = Math.round(value / boardHeight * $("#board").height());
        $("#image").height(imageHeight);
        $("#image").width(Math.round(imageHeight * ratio));
    }

    setInputs(value);
};

function round(num, decimals) {
    return +(Math.round(num + `e+${decimals}`) + `e-${decimals}`);
}

highlightInputError = (id, enable = true) => {
    $(`#${id}`).css('background-color', enable ? 'lightpink' : "");
}

showInputError = (id, message = "", enable = true) => {
    enable ? notifyError(`${id}: ${message}`) : notify();
    highlightInputError(id, enable);
}

hideInputError = (id) => {
    showInputError(id, "", false);
}

checkInput = (id, minValue, maxValue) => {

    const value = getInputValue(id);

    if(!isNumber(value)) {
        showInputError(id, 'not a number');
        return false;
    }

    if(value < minValue) {
        showInputError(id, `minimum ${id} is ${minValue} inches`);
        return false;
    }

    if(value > maxValue) {
        showInputError(id, `maximum ${id} is ${maxValue} inches`);
        return false;
    }

    hideInputError(id);
    return true;
}

checkWidthValue = () => checkInput('width', minPrintingWidth, boardWidth);
checkHeightValue = () => checkInput('height', minPrintingHeight, boardHeight);

onWidthInput = () => {

    if(!checkWidthValue()) return;

    const width = getInputValue('width');
    const height = round(width / ratio, 2);

    setInputValue('height', height);

    if(!checkHeightValue()) return;

    setInputValue('slider', useWidth ? width : height);
    OnSliderChange();
}

onHeightInput = () => {

    if(!checkHeightValue()) return;

    const height = getInputValue('height');
    const width = round(height * ratio, 2);

    setInputValue('width', width);

    if(!checkWidthValue()) return;

    setInputValue('slider', useWidth ? width : height);
    OnSliderChange();
}

resetNotifications = () => {
    hideInputError('width');
    hideInputError('height');
}

const serverURL = "https://posterpresentations.ddns.net:3030/size";

initComponents();

