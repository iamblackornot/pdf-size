initComponents = () => {
    setInputValue('slider', 50);
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
                timeout: 10000,
                complete: () => { setUIUploadCompleted(); },
            })
        ).then(onRequestSuccess)
         .catch(onRequestError);
    };

    reader.readAsDataURL(file.files[0]);
});

onRequestSuccess = (res) => {

    showPosterPreview(res.base64image, res.width, res.height);
    enableComponent("slider");
    enableComponent("width");
    enableComponent("height");
    resetNotifications();
    notify(`${res.width} x ${res.height}`);
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

const minPrintingWidth = 36;
const minPrintingHeight = 24;

let ratio = 1;
let useWidth = true;
let minPrinSize = minPrintingWidth;

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

calcPrintMinSize = () => {

    if(useWidth) {

        if(minPrintingWidth / ratio < minPrintingHeight) {
            return round(minPrintingHeight * ratio, 2);
        } else {
            return minPrintingWidth;
        }
    } else {

        if(minPrintingHeight * ratio < minPrintingWidth) {
            return round(minPrintingWidth / ratio, 2);
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
    $("#image").attr('src', 'data:image/png;base64,' + base64img);

    useWidth = width / height >= boardWidth / boardHeight;
    ratio = width / height;

    const boardMaxSize = useWidth ? boardWidth : boardHeight;
    //const printMinSize = useWidth ? minPrintingWidth : minPrintingHeight;
    minPrinSize = calcPrintMinSize();
    const pdfSize = calcPDFSize(width, height, minPrinSize);

    //add check that other dimension is larger than minPrintSize

    // slider.options.min = printMinSize;
    // slider.options.max = boardMaxSize;
    // slider.setValue(pdfSize);

    $("#slider").attr('min', minPrinSize);
    $("#slider").attr('max', boardMaxSize);
    setInputValue('slider', pdfSize);

    setInputs(pdfSize);

    OnSliderChange();
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
//const serverURL = "https://webhook.site/641668fe-da37-4bb4-bfc3-7991d00239c8";
//const serverURL = "http://localhost:3020/size";
//const serverURL = "http://143.198.54.164:3020/size";
const serverURL = "http://134.122.86.95:3020/size";

initComponents();

