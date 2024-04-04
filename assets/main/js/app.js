import Board from "./board.js";
import UI from "./ui.js";
import { readFileAsString } from "./misc.js";

const serverURL = "https://posterpresentations.ddns.net:3030/";
const pdfEndpoint = "pdf_preview";
const pptEndpoint = "ppt_preview";
const maxUploadFileSizeLimitInBytes = 1024 * 1024 * 250;

export default class App {
    constructor() {
        this.board = new Board();

        $("#browse").on("change", this.onFileSelected);
        $("form").on("submit", this.onFormSubmit.bind(this));
    }

    async start() {
        const options = await this.readFileOptions();
        this.board.applyOptions(options);
    }

    async readFileOptions() {
        const file = "./options.txt";

        const text = await readFileAsString(file);
        const lines = text.split("\n");

        const regex = new RegExp(
            /^\s*(units|width|height)\s?\=\s?([EU,eu,US,us,\d]+)\s*.*/
        );
        let options = {};

        for (const line of lines) {
            const matches = line.match(regex);

            if (!matches || matches.length < 3) continue;

            options[matches[1]] = matches[2];
        }

        return options;
    }

    onFileSelected() {
        var fileName = $("#browse").val().split("\\").pop();
        $("#file-name").text(fileName);
    }

    onFormSubmit(e) {
        UI.setUIUploadStart();
        e.preventDefault();

        var reader = new FileReader();
        const fileElement = $("#browse")[0];

        if (!fileElement || !fileElement.files.length) {
            UI.notifyError("no file uploaded");
            UI.setUIUploadCompleted();
            return;
        }

        const file = fileElement.files[0];
        const regex = /.+\.(pdf|ppt|pptx)$/;
        const matches = file.name.match(regex);

        if (!matches) {
            UI.notifyError("only pdf/ppt/pptx files are supported");
            UI.setUIUploadCompleted();
            return;
        }

        if (file.size > maxUploadFileSizeLimitInBytes) {
            UI.notifyError(
                `Upload limit is ${
                    maxUploadFileSizeLimitInBytes / 1024 / 1024
                }Mb`
            );
            UI.setUIUploadCompleted();
            return;
        }

        const isPdf = matches[1] === "pdf";
        const endpoint = serverURL + (isPdf ? pdfEndpoint : pptEndpoint);

        reader.onload = this.onFileLoad.bind(this, endpoint, reader);

        reader.readAsArrayBuffer(file);
    }

    onFileLoad(endpoint, reader) {
        $.ajax({
            url: endpoint,
            type: "POST",
            contentType: "application/octet-stream",
            data: reader.result,
            processData: false,
            success: this.onRequestSuccess.bind(this),
            complete: () => {
                UI.setUIUploadCompleted();
            },
            error: this.onRequestError,
        });
    }

    onRequestSuccess(res) {
        UI.resetNotifications();
        this.board.setPosterSource(res.width, res.height, res.base64image);
    }

    onRequestError(xhr, status, error) {
        console.log(`status: ${status}, error: ${xhr.status} ${error}`);

        let errMessage;

        if (error?.responseJSON?.error) {
            errMessage = xhr.responseJSON.error;
        } else {
            errMessage = "server not responding";
        }

        console.log("error: ", errMessage);
        UI.notifyError(errMessage);
    }
}
