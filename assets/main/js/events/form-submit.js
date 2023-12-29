import UI from "../ui.js"
import currBoard from "../board.js";

const serverURL = "https://posterpresentations.ddns.net:3050/";
//const serverURL = "http://localhost:3040/";
const pdfEndpoint = "pdf_preview";
const pptEndpoint = "ppt_preview";
const maxUploadFileSizeLimitInBytes = 1024 * 1024 * 250;

$('#browse').on("change", () => {
    var fileName = $('#browse').val().split('\\').pop();
    $('#file-name').text(fileName);
});

$('form').on('submit', function (e) {

    UI.setUIUploadStart();
    e.preventDefault();

    var reader = new FileReader();
    const fileElement = $('#browse')[0];

    if (!fileElement || !fileElement.files.length) {
        UI.notifyError('no file uploaded');
        UI.setUIUploadCompleted();
        return;
    }

    const file = fileElement.files[0];
    const regex = /.+\.(pdf|ppt|pptx)$/;
    const matches = file.name.match(regex);

    if(!matches) {
        UI.notifyError('only pdf/ppt/pptx files are supported');
        UI.setUIUploadCompleted();
        return;
    }

    if(file.size > maxUploadFileSizeLimitInBytes) {
        UI.notifyError(`Upload limit is ${ maxUploadFileSizeLimitInBytes / 1024 / 1024 }Mb`);
        UI.setUIUploadCompleted();
        return;
    }

    const isPdf = matches[1] === "pdf";
    const endpoint = serverURL + (isPdf ? pdfEndpoint : pptEndpoint);

    reader.onload = function () {
        $.ajax({
            url: endpoint,
            type: "POST",
            contentType: "application/octet-stream",
            data: reader.result,
            processData: false,
            success: onRequestSuccess,
            complete: () => { UI.setUIUploadCompleted(); },
            error: onRequestError
        })
    };
    
    reader.readAsArrayBuffer(file);
});

function onRequestSuccess(res) {
    
    UI.resetNotifications();
    currBoard.setPosterSource(res.width, res.height, res.base64image);
}

function onRequestError(xhr, status, error) { 

    console.log(`status: ${status}, error: ${xhr.status} ${error}`);

    let errMessage;

    if(error?.responseJSON?.error) {
        errMessage = xhr.responseJSON.error;
    } else {
        errMessage = 'server not responding';
    }

    console.log('error: ', errMessage);
    UI.notifyError(errMessage);
};

